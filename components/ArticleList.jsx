"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArticleList;
const ArticleItem_1 = __importDefault(require("./ArticleItem"));
const Pagination_1 = __importDefault(require("./Pagination"));
function ArticleList({ posts, currentPage, totalPages, lang }) {
    return (<>
      <div className="space-y-1">
        {posts.map((post, index) => (<ArticleItem_1.default key={post.id} post={post} index={((currentPage - 1) * 20) + index + 1} // Assuming 20 posts per page, adjust if different
         lang={lang} // Pass lang to ArticleItem
        />))}
      </div>
      <Pagination_1.default currentPage={currentPage} totalPages={totalPages} lang={lang}/> {/* Pass lang to Pagination */}
    </>);
}
