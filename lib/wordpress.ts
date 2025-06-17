import { Buffer } from 'buffer';

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

export async function fetchPosts(page: number = 1, perPage: number = 20, categoryId?: number): Promise<PaginatedPosts> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }

  try {
    let apiUrl = `${WP_API_URL}/posts?_embed=author&per_page=${perPage}&page=${page}`;
    if (categoryId) {
      apiUrl += `&categories=${categoryId}`;
    }

    const response = await fetch(
      apiUrl,
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

export async function fetchRelatedPosts(currentPostId: number, count: number = 3, lang: string = 'en'): Promise<Post[]> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return [];
  }

  try {
    // Fetch posts from the same category as the current post, excluding the current post itself
    // First, get the current post's categories
    const currentPostData = await fetch(`${WP_API_URL}/posts/${currentPostId}?_fields=categories`, {
      next: { revalidate: 60 }, // Cache for a minute
    });
    if (!currentPostData.ok) {
      console.error(`Failed to fetch categories for post ${currentPostId}`);
      return [];
    }
    const postJson = await currentPostData.json();
    const categoryIds = postJson.categories;

    if (!categoryIds || categoryIds.length === 0) {
      console.log(`Post ${currentPostId} has no categories, fetching recent posts instead.`);
      // Fallback: fetch recent posts if no categories
      const response = await fetch(
        `${WP_API_URL}/posts?_embed=author&per_page=${count}&exclude=${currentPostId}&orderby=date&order=desc`,
        {
          next: { revalidate: 60 }, // Cache for a minute
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch related posts (fallback): ${response.statusText}`);
      }
      const posts = await response.json();
      return posts.map(formatPost);
    }

    // Fetch posts from the same categories
    const response = await fetch(
      `${WP_API_URL}/posts?_embed=author&categories=${categoryIds.join(',')}&per_page=${count}&exclude=${currentPostId}`,
      {
        next: { revalidate: 60 }, // Cache for a minute
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.statusText}`);
    }

    const posts = await response.json();
    return posts.map(formatPost);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}


export async function publishPost(
  title: string,
  content: string,
  status: 'publish' | 'draft' = 'publish',
  metaTitle?: string,
  metaDescription?: string,
  language: 'en' | 'jp' = 'en' // Added language parameter
): Promise<Post | null> {
  const WP_USERNAME = process.env.WORDPRESS_USERNAME;
  const WP_PASSWORD = process.env.WORDPRESS_PASSWORD; // Or WORDPRESS_API_KEY
  const WORDPRESS_JP_CATEGORY_ID = process.env.WORDPRESS_JP_CATEGORY_ID;

  if (!WP_API_URL || !WP_USERNAME || !WP_PASSWORD) {
    console.error('WordPress API URL, username, or password/API key not configured');
    return null;
  }

  // Basic content cleaning (example, expand as needed)
  let cleanedContent = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ''); // Remove script tags, avoid 's' flag
  // Add more cleaning rules if necessary

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  // Use Application Password (recommended) or Basic Auth
  headers.append('Authorization', `Basic ${Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64')}`);

  const postData: any = {
    title,
    content: cleanedContent,
    status,
    meta: {},
    categories: [] // Initialize categories array
  };

  // Add Yoast SEO metadata if provided
  if (metaTitle) {
    postData.meta._yoast_wpseo_title = metaTitle;
  }
  if (metaDescription) {
    postData.meta._yoast_wpseo_metadesc = metaDescription;
  }

  // Add Japanese category if language is 'jp' and ID is set
  if (language === 'jp') {
    if (WORDPRESS_JP_CATEGORY_ID) {
      const jpCategoryId = parseInt(WORDPRESS_JP_CATEGORY_ID, 10);
      if (!isNaN(jpCategoryId)) {
        postData.categories.push(jpCategoryId);
        console.log(`Assigning Japanese category ID: ${jpCategoryId}`);
      } else {
        console.warn('WORDPRESS_JP_CATEGORY_ID is not a valid number. Japanese post will not be categorized.');
      }
    } else {
      console.warn('WORDPRESS_JP_CATEGORY_ID is not set. Japanese post will not be categorized.');
    }
  }

  try {
    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: headers, // Use the headers object defined above
      body: JSON.stringify(postData) // Use postData which is defined
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
