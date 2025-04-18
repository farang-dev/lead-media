# Unmanned Newsroom

An automated tech and AI news aggregator that scrapes, rewrites, and publishes articles daily.

## Features

- Automatically scrapes tech and AI articles from TechCrunch
- Uses AI to rewrite articles with unique content
- Generates SEO-optimized meta titles and descriptions
- Publishes articles to WordPress
- Runs daily at 7am via GitHub Actions
- Pagination with 20 articles per page

## Deployment Guide

### Prerequisites

1. A WordPress site with REST API enabled
2. An OpenRouter API key for AI content generation
3. A GitHub account
4. A Vercel account (free tier)

### Step 1: Set Up WordPress

1. Make sure your WordPress site has the REST API enabled
2. Create an application password for your WordPress user
3. Install Yoast SEO plugin for meta title and description support

### Step 2: Set Up GitHub Repository

1. Push your code to a GitHub repository
2. Add the following secrets to your repository:
   - `WORDPRESS_API_URL`: Your WordPress API URL (e.g., https://yourdomain.com/wp-json/wp/v2)
   - `WORDPRESS_USERNAME`: Your WordPress username
   - `WORDPRESS_API_KEY`: Your WordPress application password
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `NEXT_PUBLIC_SITE_URL`: Your website URL

### Step 3: Deploy to Vercel

1. Sign up for a Vercel account at https://vercel.com
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in Vercel:
   - `WORDPRESS_API_URL`: Your WordPress API URL
   - `NEXT_PUBLIC_SITE_URL`: Your website URL
4. Deploy your application
5. Get your Vercel tokens and add them to GitHub secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### Step 4: Connect Your Domain

1. Purchase a domain from your preferred registrar
2. Add the domain to your Vercel project
3. Configure DNS settings at your domain registrar:
   - Add an A record pointing to Vercel's IP
   - Add CNAME records for www and other subdomains

### Step 5: Verify GitHub Actions

1. Go to the "Actions" tab in your GitHub repository
2. Make sure the "Daily Article Scraper" workflow is enabled
3. You can manually trigger the workflow to test it

## Development

### Local Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the development server: `npm run dev`

### Testing the Scraper

Run the scraper script locally:

```bash
node scripts/test-full-process.js
```

## License

MIT
