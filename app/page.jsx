"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const wordpress_1 = require("@/lib/wordpress");
const ArticleList_1 = __importDefault(require("@/components/ArticleList"));
const react_1 = require("react");
async function Posts({ page }) {
    const { posts, totalPages } = await (0, wordpress_1.fetchPosts)(page);
    return <ArticleList_1.default posts={posts} currentPage={page} totalPages={totalPages}/>;
}
function Home({ searchParams, }) {
    // Get the current page from the URL query parameters
    const pageParam = searchParams.page;
    const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
    const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
    return (<main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-orange-500">Unmanned Newsroom</h1>
        <p className="text-sm text-gray-600">Latest tech and AI news, automatically curated</p>
      </header>
      <react_1.Suspense fallback={<div className="text-gray-600">Loading posts...</div>}>
        <Posts page={page}/>
      </react_1.Suspense>
    </main>);
}
