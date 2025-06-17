"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlWebsite = crawlWebsite;
exports.crawlArticleContent = crawlArticleContent;
const utils_1 = require("./utils");
const cheerio = __importStar(require("cheerio"));
async function crawlWebsite(url) {
    try {
        const response = await (0, utils_1.fetchWithTimeout)(url, { timeout: 10000 });
        const html = await response.text();
        const $ = cheerio.load(html);
        // Adjust these selectors based on the target website structure
        const articles = [];
        $('.article-item').each((_, element) => {
            const articleUrl = $(element).find('a.title').attr('href');
            const title = $(element).find('a.title').text().trim();
            if (articleUrl && title) {
                articles.push({
                    title,
                    content: '', // Will be filled when crawling the full article
                    url: new URL(articleUrl, url).toString(),
                    publishedDate: new Date()
                });
            }
        });
        return articles;
    }
    catch (error) {
        console.error('Error crawling website:', error);
        return [];
    }
}
async function crawlArticleContent(url) {
    try {
        const response = await (0, utils_1.fetchWithTimeout)(url, { timeout: 10000 });
        const html = await response.text();
        const $ = cheerio.load(html);
        // Adjust this selector based on the target website structure
        const content = $('.article-content').html() || '';
        return content;
    }
    catch (error) {
        console.error('Error crawling article content:', error);
        return '';
    }
}
