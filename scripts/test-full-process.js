// Complete test script for crawling, rewriting, and posting to WordPress
require('dotenv').config(); // Load environment variables
const cheerio = require('cheerio');
const puppeteer = require('puppeteer'); // Add puppeteer for JavaScript rendering
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
// We'll import the cleanupArticle function dynamically later
// const { cleanupArticle } = require('../lib/article-processor');
const { generateMetaData, rewriteArticle: rewriteArticleContent, translateArticleToJapanese } = require('../lib/openrouter');
const { publishPost } = require('../lib/wordpress');

// WordPress credentials from environment variables
const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID;
const WP_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;
const WORDPRESS_JP_CATEGORY_ID = process.env.WORDPRESS_JP_CATEGORY_ID; // Added for Japanese category
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL; // Used by openrouter.ts
const TARGET_WEBSITES = [
  process.env.TARGET_WEBSITE || 'https://techcrunch.com/category/artificial-intelligence/',
  'https://generativeai.pub/latest'
];

// Function to check if an article was published within the last 24 hours
function isPublishedWithin24Hours(dateString) {
  if (!dateString) return false;

  // Try to parse the date string
  let publishDate;
  try {
    // Handle ISO date format
    publishDate = new Date(dateString);

    // If invalid date, try other formats
    if (isNaN(publishDate.getTime())) {
      // Try to handle text formats like "5 hours ago", "today", etc.
      const lowerCaseDate = dateString.toLowerCase();

      if (lowerCaseDate.includes('today') ||
          lowerCaseDate.includes('hour ago') ||
          lowerCaseDate.includes('hours ago') ||
          lowerCaseDate.includes('minute ago') ||
          lowerCaseDate.includes('minutes ago')) {
        return true;
      }

      // If we can't determine, default to false
      return false;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return false;
  }

  // Check if the date is within the last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  return publishDate >= twentyFourHoursAgo;
}

// Add this diagnostic function
async function testWordPressConnection() {
  console.log('Testing WordPress connection...');
  console.log(`API URL: ${WP_API_URL}`);
  console.log(`Username: ${WP_USERNAME}`);

  // Test 1: Try to fetch posts (doesn't require auth)
  try {
    const response = await fetch(`${WP_API_URL}/posts?per_page=1`);
    console.log(`Public API Test: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error('WordPress API not accessible. Check URL and if REST API is enabled.');
      return false;
    }
  } catch (error) {
    console.error('Cannot connect to WordPress API:', error.message);
    return false;
  }

  // Test 2: Try authenticated request
  try {
    const apiKey = process.env.WORDPRESS_API_KEY;
    // Try both with and without spaces
    const apiKeyNoSpaces = apiKey.replace(/\s+/g, '');

    console.log('Testing with spaces in API key...');
    const basicAuth = Buffer.from(`${WP_USERNAME}:${apiKey}`).toString('base64');

    const authResponse = await fetch(`${WP_API_URL}/users/me`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });

    console.log(`Auth Test (with spaces): ${authResponse.status} ${authResponse.statusText}`);

    if (authResponse.ok) {
      const userData = await authResponse.json();
      console.log(`Authenticated as: ${userData.name}`);
      return true;
    }

    // Try without spaces if first attempt failed
    console.log('Testing without spaces in API key...');
    const basicAuthNoSpaces = Buffer.from(`${WP_USERNAME}:${apiKeyNoSpaces}`).toString('base64');

    const authResponseNoSpaces = await fetch(`${WP_API_URL}/users/me`, {
      headers: {
        'Authorization': `Basic ${basicAuthNoSpaces}`
      }
    });

    console.log(`Auth Test (no spaces): ${authResponseNoSpaces.status} ${authResponseNoSpaces.statusText}`);

    if (authResponseNoSpaces.ok) {
      const userData = await authResponseNoSpaces.json();
      console.log(`Authenticated as: ${userData.name}`);
      return true;
    }

    console.error('Authentication failed with both formats. Check credentials.');
    return false;
  } catch (error) {
    console.error('Error testing authentication:', error.message);
    return false;
  }
}

// 1. Crawl website to find articles using Puppeteer (handles JavaScript rendering)
async function crawlWebsite(url) {
  console.log(`Crawling website: ${url}`);
  try {
    // Use a direct HTTP request with appropriate headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    fs.writeFileSync('raw-html.txt', html);
    console.log('Raw HTML saved to raw-html.txt');

    // Use regex to extract article URLs - more reliable for TechCrunch
    const articleUrlRegex = /href="(https:\/\/techcrunch\.com\/\d{4}\/\d{2}\/\d{2}\/[^"]+)"/g;
    const matches = [...html.matchAll(articleUrlRegex)];

    console.log(`Found ${matches.length} article URLs using regex`);

    // Extract unique article URLs
    const articleUrls = [...new Set(matches.map(match => match[1]))];
    console.log(`Found ${articleUrls.length} unique article URLs`);

    // If regex approach failed, try a more aggressive browser approach
    if (articleUrls.length === 0) {
      console.log('No articles found with regex, trying browser approach with extended wait time...');

      const browser = await puppeteer.launch({
        headless: false, // Use visible browser to avoid detection
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
        defaultViewport: null
      });

      const page = await browser.newPage();

      // Set multiple headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navigate with extended timeout
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
      console.log('Page loaded');

      // Wait longer for dynamic content
      await page.waitForTimeout(10000);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-screenshot-extended.png', fullPage: true });

      // Try multiple approaches to find articles
      const foundArticles = await page.evaluate(() => {
        const articles = [];

        // Approach 1: Look for article cards/containers
        const articleCards = document.querySelectorAll('article, .post-block, .post-item, .story-card');
        if (articleCards.length > 0) {
          articleCards.forEach(card => {
            const linkElement = card.querySelector('a[href*="techcrunch.com"]');
            const titleElement = card.querySelector('h2, h3, .post-title, .post-block__title');

            if (linkElement && titleElement) {
              const url = linkElement.href;
              const title = titleElement.textContent.trim();

              if (url && title && title.length > 10 && url.includes('/20')) {
                articles.push({ title, url });
              }
            }
          });
        }

        // Approach 2: Look for specific TechCrunch selectors
        if (articles.length === 0) {
          const links = document.querySelectorAll('.post-block__title a, .article-link, .post-title a');
          links.forEach(link => {
            const url = link.href;
            const title = link.textContent.trim();

            if (url && title && title.length > 10 && url.includes('techcrunch.com') && url.includes('/20')) {
              articles.push({ title, url });
            }
          });
        }

        // Approach 3: Find all links that look like articles
        if (articles.length === 0) {
          const allLinks = document.querySelectorAll('a');
          allLinks.forEach(link => {
            const url = link.href;
            const title = link.textContent.trim();

            if (url &&
                url.includes('techcrunch.com') &&
                url.includes('/20') &&
                !url.includes('/category/') &&
                !url.includes('/author/') &&
                title &&
                title.length > 15) {

              articles.push({ title, url });
            }
          });
        }

        return articles;
      });

      console.log(`Found ${foundArticles.length} articles with browser approach`);

      // Add timestamps
      const articlesWithDates = foundArticles.map(article => ({
        ...article,
        publishedDate: new Date().toISOString()
      }));

      await browser.close();

      if (articlesWithDates.length > 0) {
        return articlesWithDates.slice(0, 5);
      }
    } else {
      // Process the URLs found with regex
      const articles = [];
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      for (let i = 0; i < Math.min(5, articleUrls.length); i++) {
        const articleUrl = articleUrls[i];
        console.log(`Getting title for article: ${articleUrl}`);

        try {
          const page = await browser.newPage();
          await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

          const title = await page.evaluate(() => {
            const titleElement = document.querySelector('h1');
            return titleElement ? titleElement.textContent.trim() : '';
          });

          if (title) {
            articles.push({
              title,
              url: articleUrl,
              publishedDate: new Date().toISOString()
            });
            console.log(`Added article: ${title}`);
          }

          await page.close();
        } catch (error) {
          console.error(`Error getting title for ${articleUrl}:`, error);
        }
      }

      await browser.close();

      if (articles.length > 0) {
        return articles;
      }
    }

    // Last resort fallback
    console.log('No articles found, returning test article for pipeline testing');
    return [{
      title: "Test Article: AI Developments at TechCrunch",
      url: "https://techcrunch.com/category/artificial-intelligence/",
      publishedDate: new Date().toISOString()
    }];
  } catch (error) {
    console.error('Error crawling website:', error);
    return [{
      title: "Test Article: AI Developments at TechCrunch",
      url: "https://techcrunch.com/category/artificial-intelligence/",
      publishedDate: new Date().toISOString()
    }];
  }
}

// Alternative crawling approach
async function crawlAlternative(url) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Try a more generic approach
    const articles = await page.evaluate(() => {
      const results = [];
      const links = document.querySelectorAll('a');

      links.forEach(link => {
        const href = link.href;
        if (href && href.includes('techcrunch.com') &&
            (href.includes('/20') || href.includes('artificial-intelligence'))) {
          const title = link.textContent.trim();

          if (title && title.length > 15 && !results.some(a => a.url === href)) {
            results.push({
              title,
              url: href,
              publishedDate: new Date().toISOString()
            });
          }
        }
      });

      return results;
    });

    await browser.close();
    console.log(`Found ${articles.length} articles with alternative approach`);

    return articles.slice(0, 1);
  } catch (error) {
    console.error('Error in alternative crawling:', error);
    return [];
  }
}

// 2. Crawl article content using Puppeteer
async function crawlArticleContent(url) {
  console.log(`Crawling article content: ${url}`);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for content to load - using TechCrunch specific selectors
    await page.waitForSelector('.article-content, .article__content, .content-column, .article-container', { timeout: 10000 })
      .catch(() => console.log('Content selector timeout - continuing anyway'));

    // Extract content - try multiple TechCrunch-specific selectors
    const content = await page.evaluate(() => {
      // Try multiple selectors that might contain the article content
      const selectors = [
        '.article-content',
        '.article__content',
        '.content-column',
        '.article-container',
        'article',
        '.post-block__content'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.innerHTML;
        }
      }

      // Fallback: try to find paragraphs within the main content area
      const paragraphs = document.querySelectorAll('article p, main p, .content p');
      if (paragraphs.length > 0) {
        return Array.from(paragraphs).map(p => p.outerHTML).join('');
      }

      return '';
    });

    // Extract the publication date
    const publishDate = await page.evaluate(() => {
      // Try different selectors for date information
      const dateSelectors = [
        'time',
        '.article__date',
        '.article-date',
        '.post-date',
        '.post-block__date',
        '[datetime]',
        '.byline time'
      ];

      for (const selector of dateSelectors) {
        const dateElement = document.querySelector(selector);
        if (dateElement) {
          // Try to get the datetime attribute first
          const datetime = dateElement.getAttribute('datetime');
          if (datetime) return datetime;

          // Otherwise get the text content
          return dateElement.textContent.trim();
        }
      }

      return null;
    });

    await browser.close();
    browser = null;

    if (!content) {
      console.log('No content found on the page');
      return { content: null, publishDate: null };
    }

    return { content, publishDate };
  } catch (error) {
    console.error('Error crawling article content:', error);
    return { content: null, publishDate: null };
  } finally {
    if (browser) {
      await browser.close().catch(err => console.error('Error closing browser:', err));
    }
  }
}

// 3. Rewrite article using OpenRouter API with SEO optimization (now a wrapper for lib functions)
async function rewriteArticleAndGenerateMeta(article) {
  console.log(`Preparing to rewrite and generate meta for article: ${article.title}`);
  try {
    console.log('Generating SEO metadata using lib/openrouter...');
    const metaData = await generateMetaData(article.title, article.content.substring(0, 1500));

    if (!metaData || !metaData.title || !metaData.description) {
      console.error('Failed to generate SEO metadata from lib/openrouter.');
      return null;
    }
    console.log('SEO Title (from lib):', metaData.title);
    console.log('Meta Description (from lib):', metaData.description);

    console.log('Rewriting article content using lib/openrouter...');
    // Use the imported rewriteArticleContent which is the actual rewrite function from lib/openrouter
    const rewrittenData = await rewriteArticleContent(article.title, article.content, metaData.title);

    if (!rewrittenData || !rewrittenData.title || !rewrittenData.content) {
      console.error('Failed to rewrite article using lib/openrouter.');
      return null;
    }
    console.log('Rewritten Title (from lib):', rewrittenData.title);

    return {
      title: rewrittenData.title,
      content: rewrittenData.content,
      metaTitle: metaData.title,
      metaDescription: metaData.description
    };

  } catch (error) {
    console.error('Error in rewriteArticleAndGenerateMeta (scripts/test-full-process.js):', error);
    return null;
  }
}

// The old rewriteArticle function's content is now largely in lib/openrouter.ts.
// The function above, rewriteArticleAndGenerateMeta, now calls those library functions.
/*
async function rewriteArticle(article) { 
  // ... (old content of local rewriteArticle, which started around line 456)
}
*/
// 4. Post to WordPress
async function postToWordPress(article, rewrittenArticle, categoryId = null) {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return false;
  }

  // Check if rewrittenArticle is an object with title and content properties
  let title, content, metaTitle, metaDescription;
  if (typeof rewrittenArticle === 'object' && rewrittenArticle.title && rewrittenArticle.content) {
    title = rewrittenArticle.title;
    content = rewrittenArticle.content;
    metaTitle = rewrittenArticle.metaTitle;
    metaDescription = rewrittenArticle.metaDescription;
  } else {
    // For backward compatibility
    title = article.title;
    content = rewrittenArticle; // Assuming rewrittenArticle is the content string
  }

  console.log(`Posting article to WordPress: ${title}`);
  console.log(`Using WordPress API URL: ${WP_API_URL}`);

  // Process the content to clean up any formatting issues
  console.log('Cleaning up article content...');

  // Since we can't directly import the TypeScript module, we'll implement the cleanup here
  let cleanedContent = content;

  // First, check if the content starts with the title and remove it
  const titleMatch = cleanedContent.match(/^\*\*([^\*]+)\*\*/);
  if (titleMatch) {
    const title = titleMatch[1];
    // Remove the title from the beginning of the content
    cleanedContent = cleanedContent.replace(new RegExp(`^\\*\\*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\n\\n`), '');
  }

  // Remove "Posted:" at the beginning of the content or anywhere in the content
  cleanedContent = cleanedContent.replace(/^Posted:\s*\n\n/g, '');
  cleanedContent = cleanedContent.replace(/^Posted:/g, '');
  cleanedContent = cleanedContent.replace(/Posted:\s*\n\n/g, '');
  cleanedContent = cleanedContent.replace(/Posted:/g, '');
  cleanedContent = cleanedContent.replace(/Posted\s+in[^\n]+\n/g, '');
  cleanedContent = cleanedContent.replace(/Posted\s+by[^\n]+\n/g, '');

  // Remove Topics section and everything after it (including subscription info)
  cleanedContent = cleanedContent.replace(/Topics[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Topics\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Topics:[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Topics:[\s\S]*$/g, '');

  // Remove subscription information sections
  cleanedContent = cleanedContent.replace(/Subscribe for the industry[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/Every weekday and Sunday[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/By submitting your email[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/TechCrunch's AI experts[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/Startups are the core[\s\S]*?Privacy Notice\./g, '');

  // Remove Popular Stories section
  cleanedContent = cleanedContent.replace(/\*\*Popular Stories:\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');

  // Remove Related Articles section - multiple patterns to catch different formats
  cleanedContent = cleanedContent.replace(/\*\*Read More on TechCrunch:\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Related Articles\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Related Articles:\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Read More on TechCrunch:[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Related Articles:[\s\S]*$/g, '');

  // Remove individual related article links
  cleanedContent = cleanedContent.replace(/– \[(.*?)\]\((.*?)\)/g, '');
  cleanedContent = cleanedContent.replace(/- \[(.*?)\]\((.*?)\)/g, '');

  // Remove About the Author section
  cleanedContent = cleanedContent.replace(/\*\*About the Author\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');
  cleanedContent = cleanedContent.replace(/About the Author[\s\S]*?(?=\n\n|\*\*|$)/g, '');

  // Remove any AI Editor or similar markers
  cleanedContent = cleanedContent.replace(/\*AI Editor\*/g, '');
  cleanedContent = cleanedContent.replace(/—\s*\n\n\*AI Editor\*/, '');

  // Remove trailing dash and AI Editor
  cleanedContent = cleanedContent.replace(/\n—\s*\n\n\*AI Editor\*$/g, '');

  // Convert any remaining bold formatting to HTML
  cleanedContent = cleanedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert any remaining italic formatting to HTML
  cleanedContent = cleanedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Remove any trailing whitespace
  cleanedContent = cleanedContent.trim();

  // Define author name for WordPress metadata
  const authorName = 'Fumi Nozawa';

  // For WordPress.com, we need to use OAuth2 authentication
  try {
    console.log('Using WordPress.com authentication...');

    // First, get an access token using client credentials
    console.log('Getting access token...');
    const tokenResponse = await fetch('https://public-api.wordpress.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': WP_CLIENT_ID,
        'client_secret': WP_CLIENT_SECRET,
        'grant_type': 'password',
        'username': WP_USERNAME,
        'password': WP_PASSWORD
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`WordPress token error status: ${tokenResponse.status} ${tokenResponse.statusText}`);
      console.error(`WordPress token error details: ${errorText}`);
      throw new Error(`WordPress token error: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully!');
    const accessToken = tokenData.access_token;

    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: title,
        content: cleanedContent,
        status: 'publish',
        author: 1, // Use the user ID of the WordPress account (usually 1 for the primary admin)
        author_name: authorName, // Use the same readable author name
        categories: categoryId ? [categoryId] : [], // Add category if provided
        meta: {
          _yoast_wpseo_title: metaTitle || title,
          _yoast_wpseo_metadesc: metaDescription || cleanedContent.substring(0, 155) + '...'
        }
      })
    });

    // Log detailed response information for debugging
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const postData = await response.json();
      console.log(`Article posted successfully! Post ID: ${postData.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('WordPress API error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error posting to WordPress:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting full article processing test...');

  // Test WordPress connection first
  const connectionOk = await testWordPressConnection();
  if (!connectionOk) {
    console.error('WordPress connection test failed. Fix connection issues before continuing.');
    // You can choose to exit here or continue with the test
    // return;
  }

  // 1. Crawl websites to find articles
  let allArticles = [];
  for (const targetUrl of TARGET_WEBSITES) {
    console.log(`
--- Processing target URL: ${targetUrl} ---`);
    let articlesFromUrl = await crawlWebsite(targetUrl);

    if (articlesFromUrl.length === 0) {
      console.log('No articles found with primary method, trying alternative approach...');
      articlesFromUrl = await crawlAlternative(targetUrl);
    }
    allArticles.push(...articlesFromUrl);
  }
  let articles = allArticles; // Use 'articles' for the rest of the script for consistency

  if (articles.length === 0) {
    console.log('No articles found. Exiting.');
    return;
  }

  console.log('\nFound articles:');
  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   URL: ${article.url}`);
    console.log('---');
  });

  // Track successful and failed articles
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    recentArticles: 0
  };

  // Process all articles
  console.log('\nProcessing all articles...');

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\nProcessing article ${i + 1}/${articles.length}: ${article.title}`);

    try {
      // 2. Crawl article content
      console.log('Crawling article content...');
      const result = await crawlArticleContent(article.url);

      if (!result || !result.content) {
        console.log('Failed to extract article content. Skipping.');
        results.failed++;
        continue;
      }

      // Check if the article was published within the last 24 hours
      if (result.publishDate) {
        console.log(`Publication date: ${result.publishDate}`);
        const isRecent = isPublishedWithin24Hours(result.publishDate);
        console.log(`Published within last 24 hours: ${isRecent ? 'Yes' : 'No'}`);

        if (!isRecent) {
          console.log('Article not published within last 24 hours. Skipping.');
          continue;
        }

        results.recentArticles++;
      } else {
        console.log('Could not determine publication date. Processing anyway.');
      }

      // Add content to the article object
      article.content = result.content;

      // 3. Rewrite the article
      console.log('Rewriting article...');
      const rewrittenArticle = await rewriteArticleContent(article); // Use the imported name

      if (!rewrittenArticle || !rewrittenArticle.content) {
        console.log('Failed to rewrite article. Skipping.');
        results.failed++;
        continue;
      }

      console.log('Article rewritten successfully!');
      console.log(`Original title: ${article.title}`);
      console.log(`Rewritten title: ${rewrittenArticle.title}`);

      // 4. Post to WordPress (English version)
      console.log('Posting English article to WordPress...');
      const postedEnglish = await postToWordPress(article, rewrittenArticle);

      if (postedEnglish) {
        console.log('English article posted to WordPress successfully!');
        results.successful++;
      } else {
        console.log('Failed to post English article to WordPress.');
        results.failed++;
      }

      // 5. Translate to Japanese
      console.log('Translating article to Japanese...');
      const translatedArticle = await translateArticleToJapanese(rewrittenArticle.title, rewrittenArticle.content);

      if (!translatedArticle || !translatedArticle.title || !translatedArticle.content) {
        console.log('Failed to translate article to Japanese. Skipping Japanese post.');
      } else {
        console.log('Article translated to Japanese successfully!');
        console.log(`Japanese title: ${translatedArticle.title}`);

        // 6. Post to WordPress (Japanese version)
        console.log('Posting Japanese article to WordPress...');
        // Pass the Japanese category ID
        const postedJapanese = await postToWordPress(translatedArticle, translatedArticle, WORDPRESS_JP_CATEGORY_ID);
        if (postedJapanese) {
          console.log('Japanese article posted to WordPress successfully!');
          // Potentially update a different counter for successful Japanese posts if needed
        } else {
          console.log('Failed to post Japanese article to WordPress.');
          // Potentially update a different counter for failed Japanese posts if needed
        }
      }

      results.processed++;

      // Add a delay between processing articles to avoid rate limiting
      if (i < articles.length - 1) {
        console.log('Waiting 5 seconds before processing next article...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Error processing article: ${error.message}`);
      results.failed++;
    }
  }

  // Print summary
  console.log('\n=== PROCESSING SUMMARY ===');
  console.log(`Total articles found: ${articles.length}`);
  console.log(`Articles published in last 24 hours: ${results.recentArticles}`);
  console.log(`Articles processed: ${results.processed}`);
  console.log(`Articles successfully posted: ${results.successful}`);
  console.log(`Articles failed: ${results.failed}`);
  console.log('=========================');

  console.log('\nProcess completed.');
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error in main process:', error);
  });
}

// Export the main function for use in other scripts
module.exports = { main };
