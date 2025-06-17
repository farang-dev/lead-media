"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FullArticle;
const date_fns_1 = require("date-fns");
const link_1 = __importDefault(require("next/link"));
function FullArticle({ post }) {
    var _a, _b, _c;
    const timeAgo = (0, date_fns_1.formatDistanceToNow)(new Date(post.date), { addSuffix: true });
    const author = ((_c = (_b = (_a = post._embedded) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.name) || 'Anonymous';
    // Process the content to ensure proper formatting
    let processedContent = post.content.rendered;
    // Remove any remaining related articles section
    processedContent = processedContent.replace(/<p>(?:Read More|Related Articles):[\s\S]*?$/i, '');
    // Remove any remaining about the author section
    processedContent = processedContent.replace(/<p>(?:About the Author)[\s\S]*?$/i, '');
    // Remove any remaining asterisk formatting
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return (<article className="max-w-3xl mx-auto px-4 py-8">
      <link_1.default href="/" className="text-orange-500 hover:underline mb-4 inline-block">
        ← Back to all articles
      </link_1.default>

      <h1 className="text-3xl font-bold mb-4 text-gray-900" dangerouslySetInnerHTML={{ __html: post.title.rendered }}/>

      <div className="text-sm text-gray-500 mb-8">
        Posted {timeAgo} by {author}
      </div>

      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: processedContent }}/>
    </article>);
}
