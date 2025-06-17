"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LanguageSwitcher;
const navigation_1 = require("next/navigation");
function LanguageSwitcher() {
    const pathname = (0, navigation_1.usePathname)();
    const router = (0, navigation_1.useRouter)();
    // Handle cases where pathname might be null (e.g., during initial render or specific routing scenarios)
    if (pathname === null) {
        // Optionally, render nothing or a disabled state
        return null;
    }
    const isJapanese = pathname.startsWith('/jp');
    const switchToEnglish = () => {
        // Ensure pathname is not null here due to the check above
        const newPath = isJapanese ? pathname.replace('/jp', '') || '/' : pathname;
        router.push(newPath);
    };
    const switchToJapanese = () => {
        // Ensure pathname is not null here due to the check above
        const newPath = isJapanese ? pathname : `/jp${pathname}`;
        router.push(newPath);
    };
    return (<div className="fixed top-4 right-4 z-50">
      <button onClick={switchToEnglish} disabled={!isJapanese} className={`px-3 py-1 text-sm rounded-l-md transition-colors
          ${!isJapanese ? 'bg-orange-500 text-white cursor-default' : 'bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
        EN
      </button>
      <button onClick={switchToJapanese} disabled={isJapanese} className={`px-3 py-1 text-sm rounded-r-md transition-colors
          ${isJapanese ? 'bg-orange-500 text-white cursor-default' : 'bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
        JP
      </button>
    </div>);
}
