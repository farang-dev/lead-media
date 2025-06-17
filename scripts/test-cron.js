"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This script tests the article processing flow without using the API endpoint
const scheduler_1 = require("../lib/scheduler");
console.log('Starting manual test of article processing flow...');
// Run the process articles function directly
(0, scheduler_1.processArticles)()
    .then(() => {
    console.log('Article processing completed successfully');
})
    .catch((error) => {
    console.error('Error during article processing:', error);
});
