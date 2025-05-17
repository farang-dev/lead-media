#!/bin/bash

# This script runs the article scraper without any GitHub Actions complexity
# It can be used as a fallback if GitHub Actions continues to fail

# Exit on error
set -e

echo "Starting article scraper..."

# Install dependencies
echo "Installing dependencies..."
npm install --no-package-lock

# Run the scraper
echo "Running article scraper..."
node scripts/test-full-process.js

# Generate sitemap
echo "Generating sitemap..."
node scripts/generate-sitemap.js

echo "Article scraper completed successfully!"
