"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Pagination;
const link_1 = __importDefault(require("next/link"));
function Pagination({ currentPage, totalPages, lang }) {
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
    return (<div className="flex justify-center items-center space-x-2 my-8">
      {/* Previous page button */}
      {currentPage > 1 && (<link_1.default href={`${basePath}/?page=${currentPage - 1}`} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
          &laquo; Prev
        </link_1.default>)}
      
      {/* First page and ellipsis if needed */}
      {startPage > 1 && (<>
          <link_1.default href={`${basePath}/?page=1`} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
            1
          </link_1.default>
          {startPage > 2 && (<span className="px-3 py-1 text-gray-500">...</span>)}
        </>)}
      
      {/* Page numbers */}
      {pageNumbers.map(number => (<link_1.default key={number} href={`${basePath}/?page=${number}`} className={`px-3 py-1 border rounded ${number === currentPage
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'}`}>
          {number}
        </link_1.default>))}
      
      {/* Last page and ellipsis if needed */}
      {endPage < totalPages && (<>
          {endPage < totalPages - 1 && (<span className="px-3 py-1 text-gray-500">...</span>)}
          <link_1.default href={`${basePath}/?page=${totalPages}`} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
            {totalPages}
          </link_1.default>
        </>)}
      
      {/* Next page button */}
      {currentPage < totalPages && (<link_1.default href={`${basePath}/?page=${currentPage + 1}`} className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">
          Next &raquo;
        </link_1.default>)}
    </div>);
}
