"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RelatedArticles;
const link_1 = __importDefault(require("next/link"));
function RelatedArticles({ posts }) {
    if (!posts || posts.length === 0) {
        return null;
    }
    return (<div className="mt-12 pt-6 border-t border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {posts.map((post) => (<div key={post.id} className="bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
            <link_1.default href={`/post/${post.slug}`} className="block">
              <h3 className="font-medium text-gray-900 mb-2 hover:text-orange-500 transition-colors" dangerouslySetInnerHTML={{ __html: post.title.rendered }}/>
              <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{
                __html: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
            }}/>
            </link_1.default>
          </div>))}
      </div>
    </div>);
}
