"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const next_1 = require("@vercel/analytics/next");
const script_1 = __importDefault(require("next/script"));
const LanguageSwitcher_1 = __importDefault(require("@/components/LanguageSwitcher")); // Import the new component
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unmanned-newsroom.com';
exports.metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Unmanned Newsroom - AI & Tech News',
        template: `%s | Unmanned Newsroom`,
    },
    description: 'Stay updated with the latest in tech and AI. Unmanned Newsroom delivers automatically curated news, analysis, and insights on artificial intelligence, machine learning, and emerging technologies.',
    keywords: ['AI news', 'tech news', 'artificial intelligence', 'machine learning', 'technology updates', 'automated news', 'robot journalism'],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Unmanned Newsroom - AI & Tech News',
        description: 'Stay updated with the latest in tech and AI. Unmanned Newsroom delivers automatically curated news, analysis, and insights on artificial intelligence, machine learning, and emerging technologies.',
        url: siteUrl,
        siteName: 'Unmanned Newsroom',
        images: [
            {
                url: `${siteUrl}/og-image.png`, // TODO: Create an OG image
                width: 1200,
                height: 630,
                alt: 'Unmanned Newsroom - AI & Tech News',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Unmanned Newsroom - AI & Tech News',
        description: 'Stay updated with the latest in tech and AI. Unmanned Newsroom delivers automatically curated news, analysis, and insights on artificial intelligence, machine learning, and emerging technologies.',
        // TODO: Add Twitter creator/site username if available
        // siteId: 'yourTwitterSiteId',
        // creator: '@yourTwitterHandle',
        // creatorId: 'yourTwitterCreatorId',
        images: [`${siteUrl}/twitter-image.png`], // TODO: Create a Twitter image
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    // TODO: Add icons and manifest if PWA features are desired
    // icons: {
    //   icon: '/favicon.ico',
    //   shortcut: '/favicon-16x16.png',
    //   apple: '/apple-touch-icon.png',
    // },
    // manifest: `${siteUrl}/site.webmanifest`,
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                url: siteUrl,
                name: 'Unmanned Newsroom',
                description: 'Latest tech and AI news, automatically curated',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${siteUrl}/search?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            }),
        }}/>
        {/* Google Analytics */}
        <script_1.default async src="https://www.googletagmanager.com/gtag/js?id=G-SK5TSDVM67" strategy="afterInteractive"/>
        <script_1.default id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SK5TSDVM67');
          `}
        </script_1.default>
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <LanguageSwitcher_1.default /> {/* Add the LanguageSwitcher component */}
        <div className="min-h-screen">
          {children}
        </div>
        <next_1.Analytics />
      </body>
    </html>);
}
