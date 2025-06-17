"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMetadata = generateMetadata;
exports.default = PostPageJp;
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
            title: '記事が見つかりません',
            description: '要求された記事は見つかりませんでした。'
        };
    }
    const metaTitle = ((_a = post.meta) === null || _a === void 0 ? void 0 : _a.yoast_title) || post.title.rendered;
    const metaDescription = ((_b = post.meta) === null || _b === void 0 ? void 0 : _b.yoast_description) || post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';
    return {
        title: metaTitle,
        description: metaDescription,
        alternates: {
            canonical: `/jp/post/${params.slug}`,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            type: 'article',
            publishedTime: post.date,
            authors: [((_e = (_d = (_c = post._embedded) === null || _c === void 0 ? void 0 : _c.author) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.name) || 'Anonymous'],
            locale: 'ja_JP',
            siteName: process.env.SITE_NAME || 'Your Site Name',
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
        }
    };
}
async function PostPageJp({ params }) {
    console.log('PostPageJp component rendering with params:', params);
    console.log(`Attempting to fetch post with slug (JP): "${params.slug}"`);
    const post = await (0, wordpress_1.fetchPost)(params.slug);
    if (!post) {
        console.log(`Post not found for slug (JP): "${params.slug}", redirecting to 404 page`);
        (0, navigation_1.notFound)();
    }
    console.log(`Successfully fetched post (JP): "${post.title.rendered}"`);
    const relatedPosts = await (0, wordpress_1.fetchRelatedPosts)(post.id, 3, 'jp'); // Assuming fetchRelatedPosts can take a lang hint
    console.log(`Fetched ${relatedPosts.length} related posts (JP)`);
    return (<>
      <FullArticle_1.default post={post}/>
      <div className="max-w-3xl mx-auto px-4">
        <RelatedArticles_1.default posts={relatedPosts}/>
        <div className="mt-8 pb-8">
          <link_1.default href="/jp" className="text-orange-500 hover:underline inline-block">
            ← すべての記事に戻る
          </link_1.default>
        </div>
      </div>
    </>);
}
