#!/bin/bash

# This script can be run as a cron job on your local machine or a server
# to scrape and publish articles without relying on GitHub Actions

# Change to the project directory
cd "$(dirname "$0")/.."

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Install dependencies if needed
npm install

# Run the scraper script
node scripts/test-full-process.js

# Generate sitemap
node scripts/generate-sitemap.js

# Optional: Commit and push changes if running on a server
# git add public/sitemap.xml
# git commit -m "Update sitemap with latest articles" || echo "No changes to commit"
# git push
