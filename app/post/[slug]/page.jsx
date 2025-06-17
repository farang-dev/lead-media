"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetadata = generateMetadata;
exports.default = PostPage;
const wordpress_1 = require("@/lib/wordpress");
const FullArticle_1 = __importDefault(require("@/components/FullArticle"));
const RelatedArticles_1 = __importDefault(require("@/components/RelatedArticles"));
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
async function generateMetadata({ params }) {
    var _a, _b, _c, _d, _e;
    const post = await (0, wordpress_1.fetchPost)(params.slug);
    if (!post) {
        return {
            title: 'Article Not Found',
            description: 'The requested article could not be found.'
        };
    }
    // Check if the post has meta title and description
    const metaTitle = ((_a = post.meta) === null || _a === void 0 ? void 0 : _a.yoast_title) || post.title.rendered;
    const metaDescription = ((_b = post.meta) === null || _b === void 0 ? void 0 : _b.yoast_description) || post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';
    return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            type: 'article',
            publishedTime: post.date,
            authors: [((_e = (_d = (_c = post._embedded) === null || _c === void 0 ? void 0 : _c.author) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.name) || 'Anonymous']
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription
        }
    };
}
async function PostPage({ params }) {
    console.log('PostPage component rendering with params:', params);
    // Log the slug we're trying to fetch
    console.log(`Attempting to fetch post with slug: "${params.slug}"`);
    const post = await (0, wordpress_1.fetchPost)(params.slug);
    if (!post) {
        console.log(`Post not found for slug: "${params.slug}", redirecting to 404 page`);
        (0, navigation_1.notFound)();
    }
    console.log(`Successfully fetched post: "${post.title.rendered}"`);
    // Fetch related articles
    const relatedPosts = await (0, wordpress_1.fetchRelatedPosts)(post.id, 3);
    console.log(`Fetched ${relatedPosts.length} related posts`);
    return (<>
      <FullArticle_1.default post={post}/>
      <div className="max-w-3xl mx-auto px-4">
        <RelatedArticles_1.default posts={relatedPosts}/>
        <div className="mt-8 pb-8">
          <link_1.default href="/" className="text-orange-500 hover:underline inline-block">
            ← Back to all articles
          </link_1.default>
        </div>
      </div>
    </>);
}
