import { Post } from '@/lib/wordpress';
import ArticleItem from './ArticleItem';
import Pagination from './Pagination';

interface ArticleListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  lang?: string; // Added lang prop
}

export default function ArticleList({ posts, currentPage, totalPages, lang }: ArticleListProps) {
  return (
    <>
      <div className="space-y-1">
        {posts.map((post, index) => (
          <ArticleItem
            key={post.id}
            post={post}
            index={((currentPage - 1) * 20) + index + 1} // Assuming 20 posts per page, adjust if different
            lang={lang} // Pass lang to ArticleItem
          />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} lang={lang} /> {/* Pass lang to Pagination */}
    </>
  );
}
