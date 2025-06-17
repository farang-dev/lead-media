import { fetchPost, fetchRelatedPosts } from '@/lib/wordpress';
import FullArticle from '@/components/FullArticle';
import RelatedArticles from '@/components/RelatedArticles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  if (!post) {
    return {
      title: '記事が見つかりません',
      description: '要求された記事は見つかりませんでした。'
    };
  }

  const metaTitle = post.meta?.yoast_title || post.title.rendered;
  const metaDescription = post.meta?.yoast_description || post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';

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
      authors: [post._embedded?.author?.[0]?.name || 'Anonymous'],
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

export default async function PostPageJp({ params }: PostPageProps) {
  console.log('PostPageJp component rendering with params:', params);
  console.log(`Attempting to fetch post with slug (JP): "${params.slug}"`);

  const post = await fetchPost(params.slug);

  if (!post) {
    console.log(`Post not found for slug (JP): "${params.slug}", redirecting to 404 page`);
    notFound();
  }

  console.log(`Successfully fetched post (JP): "${post.title.rendered}"`);

  const relatedPosts = await fetchRelatedPosts(post.id, 3, 'jp'); // Assuming fetchRelatedPosts can take a lang hint
  console.log(`Fetched ${relatedPosts.length} related posts (JP)`);

  return (
    <>
      <FullArticle post={post} />
      <div className="max-w-3xl mx-auto px-4">
        <RelatedArticles posts={relatedPosts} />
        <div className="mt-8 pb-8">
          <Link href="/jp" className="text-orange-500 hover:underline inline-block">
            ← すべての記事に戻る
          </Link>
        </div>
      </div>
    </>
  );
}