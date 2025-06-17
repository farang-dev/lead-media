import { fetchPosts } from '@/lib/wordpress';
import ArticleList from '@/components/ArticleList';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '無人ニュースルーム - 最新AI・テックニュース',
  description: 'AIとテクノロジーに関する最新ニュースを自動でお届けします。',
  alternates: {
    canonical: '/jp',
  },
  openGraph: {
    title: '無人ニュースルーム - 最新AI・テックニュース',
    description: 'AIとテクノロジーに関する最新ニュースを自動でお届けします。',
    url: '/jp',
    siteName: process.env.SITE_NAME || 'Unmanned Newsroom',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '無人ニュースルーム - 最新AI・テックニュース',
    description: 'AIとテクノロジーに関する最新ニュースを自動でお届けします。',
  },
};

interface PostsProps {
  page: number;
}

async function PostsJp({ page }: PostsProps) {
  const jpCategoryIdString = process.env.WORDPRESS_JP_CATEGORY_ID;
  let categoryId: number | undefined = undefined;

  if (jpCategoryIdString && !isNaN(parseInt(jpCategoryIdString))) {
    categoryId = parseInt(jpCategoryIdString);
  } else {
    console.warn(
      'WORDPRESS_JP_CATEGORY_ID is not set or is not a valid number. Falling back to a non-existent category ID to prevent showing all posts. Please set this environment variable correctly.'
    );
    // Use a category ID that is highly unlikely to exist, effectively showing no posts.
    // This is safer than fetching all posts if the ID is missing.
    categoryId = 999999; 
  }

  const { posts, totalPages } = await fetchPosts(page, 10, categoryId);

  return <ArticleList posts={posts} currentPage={page} totalPages={totalPages} lang="jp" />;
}

export default function HomeJp({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const pageParam = searchParams.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-orange-500">無人ニュースルーム</h1>
        <p className="text-sm text-gray-600">AIとテクノロジーに関する最新ニュースを自動でお届け</p>
      </header>
      <Suspense fallback={<div className="text-gray-600">記事を読み込んでいます...</div>}>
        <PostsJp page={page} />
      </Suspense>
    </main>
  );
}