import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  lang?: string; // Added lang prop
}

export default function Pagination({ currentPage, totalPages, lang }: PaginationProps) {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const basePath = lang === 'jp' ? '/jp' : '';

  // Calculate the range of page numbers to show
  const pageNumbers = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 my-8">
      {/* Previous page button */}
      {currentPage > 1 && (
        <Link 
          href={`${basePath}/?page=${currentPage - 1}`}
          className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
        >
          &laquo; Prev
        </Link>
      )}
      
      {/* First page and ellipsis if needed */}
      {startPage > 1 && (
        <>
          <Link 
            href={`${basePath}/?page=1`}
            className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
          >
            1
          </Link>
          {startPage > 2 && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}
        </>
      )}
      
      {/* Page numbers */}
      {pageNumbers.map(number => (
        <Link 
          key={number}
          href={`${basePath}/?page=${number}`}
          className={`px-3 py-1 border rounded ${ 
            number === currentPage 
              ? 'bg-orange-500 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {number}
        </Link>
      ))}
      
      {/* Last page and ellipsis if needed */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}
          <Link 
            href={`${basePath}/?page=${totalPages}`}
            className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
          >
            {totalPages}
          </Link>
        </>
      )}
      
      {/* Next page button */}
      {currentPage < totalPages && (
        <Link 
          href={`${basePath}/?page=${currentPage + 1}`}
          className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
        >
          Next &raquo;
        </Link>
      )}
    </div>
  );
}
