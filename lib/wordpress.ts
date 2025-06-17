export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  date: string;
  author: number;
  slug: string;
  meta?: {
    yoast_title?: string;
    yoast_description?: string;
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
  };
  _embedded?: {
    author?: Array<{
      name: string;
    }>;
  };
}

const WP_API_URL = process.env.WORDPRESS_API_URL;

export interface PaginatedPosts {
  posts: Post[];
  totalPages: number;
  totalPosts: number;
}

export async function fetchPosts(page: number = 1, perPage: number = 20): Promise<PaginatedPosts> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }

  try {
    const response = await fetch(
      `${WP_API_URL}/posts?_embed=author&per_page=${perPage}&page=${page}`,
      {
        next: { revalidate: 10 }, // Revalidate every 10 seconds during development
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    return {
      posts: posts.map(formatPost),
      totalPages,
      totalPosts
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  console.log(`Attempting to fetch post with slug: "${slug}"`);

  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return null;
  }

  console.log(`Using WordPress API URL: ${WP_API_URL}`);

  try {
    // Construct the API URL
    const apiUrl = `${WP_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=author`;
    console.log(`Making request to: ${apiUrl}`);

    const response = await fetch(
      apiUrl,
      {
        next: { revalidate: 10 },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`Received ${posts.length} posts from API`);

    if (posts.length === 0) {
      console.log(`No posts found with slug: "${slug}"`);

      // For debugging: Let's try to fetch all posts to see what's available
      console.log('Attempting to fetch all posts to check available slugs...');
      const allPostsResponse = await fetch(`${WP_API_URL}/posts?per_page=5`, {
        next: { revalidate: 10 },
        headers: { 'Accept': 'application/json' }
      });

      if (allPostsResponse.ok) {
        const allPosts = await allPostsResponse.json();
        console.log('Available posts:');
        allPosts.forEach((post: any) => {
          console.log(`- ID: ${post.id}, Slug: "${post.slug}", Title: "${post.title.rendered}"`);
        });
      } else {
        console.log('Could not fetch all posts for debugging');
      }

      return null;
    }

    console.log(`Found post with title: "${posts[0].title.rendered}"`);
    return formatPost(posts[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

function formatPost(post: any): Post {
  return {
    id: post.id,
    title: {
      rendered: post.title.rendered
    },
    content: {
      rendered: post.content.rendered
    },
    excerpt: {
      rendered: post.excerpt.rendered
    },
    link: post.link,
    date: post.date,
    author: post.author,
    slug: post.slug,
    _embedded: post._embedded || {
      author: [{
        name: 'Anonymous'
      }]
    }
  };
}

// Dummy data for development
function getDummyPosts(): Post[] {
  return [
    {
      id: 1,
      title: {
        rendered: "Local WordPress Not Connected"
      },
      content: {
        rendered: "Please make sure your local WordPress instance is running at the correct URL"
      },
      excerpt: {
        rendered: "Check your WordPress connection"
      },
      link: "#",
      date: new Date().toISOString(),
      author: 1,
      slug: "local-wordpress-not-connected",
      _embedded: {
        author: [{
          name: "System"
        }]
      }
    }
  ];
}

export async function fetchRelatedPosts(currentPostId: number, count: number = 3): Promise<Post[]> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return [];
  }

  try {
    // Fetch recent posts excluding the current one
    const response = await fetch(
      `${WP_API_URL}/posts?_embed=author&per_page=${count + 1}&exclude=${currentPostId}`,
      {
        next: { revalidate: 10 },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.statusText}`);
    }

    const posts = await response.json();

    // Return only the requested number of posts
    return posts.slice(0, count).map(formatPost);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function publishPost(title: string, content: string, status: 'publish' | 'draft' = 'publish', metaTitle?: string, metaDescription?: string, language?: 'en' | 'jp'): Promise<Post | null> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return null;
  }

  const WP_USERNAME = process.env.WORDPRESS_USERNAME;
  const WP_API_KEY = process.env.WORDPRESS_API_KEY;

  if (!WP_USERNAME || !WP_API_KEY) {
    console.error('WordPress credentials not configured');
    return null;
  }

  try {
    // Process the content to clean up any formatting issues
    const { cleanupArticle } = await import('./article-processor');
    let cleanedContent = cleanupArticle(content);

    // Additional cleanup for any remaining formatting issues
    // Remove any remaining related articles section
    cleanedContent = cleanedContent.replace(/(?:Read More|Related Articles):([\s\S]*?)$/i, '');

    // Remove any remaining about the author section
    cleanedContent = cleanedContent.replace(/(?:About the Author)([\s\S]*?)$/i, '');

    // Create basic auth header
    const basicAuth = Buffer.from(`${WP_USERNAME}:${WP_API_KEY}`).toString('base64');

    // Prepare data for the post
    const postPayload: any = {
      title,
      content: cleanedContent,
      status, // Use the status parameter from function arguments
      meta: {
        _yoast_wpseo_title: metaTitle || title,
        _yoast_wpseo_metadesc: metaDescription || cleanedContent.substring(0, 155) + '...'
      },
      categories: [] // Initialize categories
      // tags: [] // Initialize tags if needed, e.g., postPayload.tags = [];
    };

    // If language is Japanese, assign to a specific category
    if (language === 'jp') {
      const jpCategoryIdStr = process.env.WORDPRESS_JP_CATEGORY_ID;
      if (jpCategoryIdStr) { // Check if the env var is set
          const jpCategoryId = parseInt(jpCategoryIdStr, 10);
          if (!isNaN(jpCategoryId)) { // Check if parsing was successful
              postPayload.categories.push(jpCategoryId);
          } else {
              console.warn(`WORDPRESS_JP_CATEGORY_ID ('${jpCategoryIdStr}') is not a valid number. Japanese post may not be categorized correctly.`);
          }
      } else {
          console.warn('WORDPRESS_JP_CATEGORY_ID not set. Japanese post may not be categorized correctly. Consider setting a default category ID or ensuring the .env variable is available.');
          // Example: postPayload.categories.push(10); // Default Japanese category ID if desired
      }
    }

    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify(postPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', errorText);
      return null; // Return null on failure
    }

    const createdPost = await response.json(); // API returns the created post object
    console.log(`Article posted successfully! Post ID: ${createdPost.id}`);
    return formatPost(createdPost); // Format and return the Post object
  } catch (error) {
    console.error('Error posting to WordPress:', error);
    return null; // Return null on exception
  }
}
