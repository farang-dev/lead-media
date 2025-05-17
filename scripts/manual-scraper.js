#!/usr/bin/env node

/**
 * Manual Scraper Script
 * 
 * This script can be run manually to scrape and publish articles without relying on GitHub Actions.
 * It uses the same code as the GitHub Actions workflow but runs locally.
 * 
 * Usage:
 * node scripts/manual-scraper.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Import the test-full-process.js script
const { main } = require('./test-full-process');

// Run the main function
console.log('Starting manual scraper...');
main()
  .then(() => {
    console.log('Manual scraper completed successfully!');
  })
  .catch((error) => {
    console.error('Error running manual scraper:', error);
    process.exit(1);
  });
