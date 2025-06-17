"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processArticles = processArticles;
const crawler_1 = require("./crawler");
const openrouter_1 = require("./openrouter");
const wordpress_1 = require("./wordpress");
// Keep track of processed articles to avoid duplicates
const processedUrls = new Set();
async function processArticles() {
    console.log('Starting article processing...');
    // Configure the website URL to crawl
    const targetWebsite = process.env.TARGET_WEBSITE;
    if (!targetWebsite) {
        console.error('Target website not configured');
        return;
    }
    try {
        // Step 1: Crawl the website for article listings
        const articles = await (0, crawler_1.crawlWebsite)(targetWebsite);
        console.log(`Found ${articles.length} articles`);
        // Step 2: Process each article that hasn't been processed before
        for (const article of articles) {
            if (processedUrls.has(article.url)) {
                console.log(`Skipping already processed article: ${article.title}`);
                continue;
            }
            console.log(`Processing article: ${article.title}`);
            // Step 3: Crawl the full article content
            const content = await (0, crawler_1.crawlArticleContent)(article.url);
            article.content = content;
            if (!content) {
                console.log(`Skipping article with no content: ${article.title}`);
                continue;
            }
            // Step 4: Rewrite the article using OpenRouter
            const rewrittenArticle = await (0, openrouter_1.rewriteArticle)(article); // Reverted: rewriteArticle expects CrawledArticle
            // Step 5: Publish to WordPress
            const published = await (0, wordpress_1.publishPost)(rewrittenArticle.title, // title is not optional in RewrittenArticle
            rewrittenArticle.content, // content is not optional in RewrittenArticle
            'publish', // Explicitly set status, publishPost expects it as 3rd param if meta is provided
            rewrittenArticle.metaTitle || '', // Provide default if undefined
            rewrittenArticle.metaDescription || '' // Provide default if undefined
            );
            if (published) {
                console.log(`Successfully published: ${article.title}`);
                processedUrls.add(article.url);
            }
            else {
                console.error(`Failed to publish: ${article.title}`);
            }
            // Add a small delay between processing articles
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log('Article processing completed');
    }
    catch (error) {
        console.error('Error in article processing:', error);
    }
}
