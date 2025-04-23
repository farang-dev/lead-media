// Simple WordPress posting test script
require('dotenv').config(); // Load from standard .env file
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// WordPress credentials
const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_API_KEY = process.env.WORDPRESS_API_KEY || process.env.WORDPRESS_PASSWORD; // Try password as fallback

async function testWordPressPost() {
  // Debug environment variables
  console.log('Environment variables:');
  console.log('WORDPRESS_API_URL:', process.env.WORDPRESS_API_URL);
  console.log('WORDPRESS_USERNAME:', process.env.WORDPRESS_USERNAME);
  console.log('WORDPRESS_PASSWORD:', process.env.WORDPRESS_PASSWORD ? '[REDACTED]' : 'undefined');
  console.log('WORDPRESS_API_KEY:', process.env.WORDPRESS_API_KEY ? '[REDACTED]' : 'undefined');
  
  if (!WP_API_URL) {
    console.error('ERROR: WORDPRESS_API_URL is not defined in your environment variables');
    console.log('Please check your .env or .env.local file');
    return;
  }
  
  if (!WP_USERNAME) {
    console.error('ERROR: WORDPRESS_USERNAME is not defined in your environment variables');
    console.log('Please check your .env or .env.local file');
    return;
  }
  
  console.log('\nTesting WordPress posting with different methods...');
  console.log(`API URL: ${WP_API_URL}`);
  console.log(`Username: ${WP_USERNAME}`);
  
  // Create a simple test post
  const testPost = {
    title: 'Test Post ' + new Date().toISOString(),
    content: 'This is a test post created at ' + new Date().toISOString(),
    status: 'draft' // Use draft to avoid cluttering your site
  };
  
  // Method 1: Basic Auth with Application Password
  try {
    console.log('\nMethod 1: Basic Auth with Application Password');
    const basicAuth = Buffer.from(`${WP_USERNAME}:${WP_API_KEY}`).toString('base64');
    
    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify(testPost)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Success! Post created with ID: ${data.id}`);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error with Method 1:', error.message);
  }
  
  // Method 2: Try with password instead of application password
  try {
    console.log('\nMethod 2: Basic Auth with regular password');
    const regularPassword = process.env.WORDPRESS_PASSWORD;
    const basicAuth = Buffer.from(`${WP_USERNAME}:${regularPassword}`).toString('base64');
    
    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify(testPost)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Success! Post created with ID: ${data.id}`);
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error with Method 2:', error.message);
  }
  
  // Method 3: Try with JWT authentication if available
  if (WP_API_URL) {
    const JWT_AUTH_URL = `${WP_API_URL.replace('/wp/v2', '')}/jwt-auth/v1/token`;
    try {
      console.log('\nMethod 3: JWT Authentication (if plugin installed)');
      // First get a token
      const tokenResponse = await fetch(JWT_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: WP_USERNAME,
          password: process.env.WORDPRESS_PASSWORD
        })
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('JWT token obtained');
        
        // Use token to create post
        const response = await fetch(`${WP_API_URL}/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`
          },
          body: JSON.stringify(testPost)
        });
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Success! Post created with ID: ${data.id}`);
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } else {
        console.log('JWT authentication not available or failed');
      }
    } catch (error) {
      console.log('JWT authentication not available or failed:', error.message);
    }
  }
  
  console.log('\nTest completed.');
}

// Run the test
testWordPressPost().catch(error => {
  console.error('Unhandled error:', error);
});
