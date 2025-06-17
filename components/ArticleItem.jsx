"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArticleItem;
const date_fns_1 = require("date-fns");
const link_1 = __importDefault(require("next/link"));
function ArticleItem({ post, index, lang }) {
    var _a, _b, _c;
    const timeAgo = (0, date_fns_1.formatDistanceToNow)(new Date(post.date), { addSuffix: true });
    const author = ((_c = (_b = (_a = post._embedded) === null || _a === void 0 ? void 0 : _a.author) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.name) || 'Anonymous';
    const postUrl = lang === 'jp' ? `/jp/post/${post.slug}` : `/post/${post.slug}`;
    return (<article className="flex gap-2 py-4 border-b border-gray-100">
      <span className="text-gray-500 w-6 text-right flex-shrink-0">{index}.</span>
      <div className="flex-grow">
        <link_1.default href={postUrl} // Use the constructed postUrl
     className="text-gray-900 hover:underline font-medium block mb-1" dangerouslySetInnerHTML={{ __html: post.title.rendered }}/>
        {/* Debug info */}
        <div className="text-xs text-gray-400">
          Slug: {post.slug}
        </div>
        <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}/>
        <div className="text-xs text-gray-500">
          {timeAgo} by {author}
        </div>
      </div>
    </article>);
}
