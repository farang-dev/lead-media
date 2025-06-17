import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unmanned-newsroom.com';

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
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
          }}
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SK5TSDVM67"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SK5TSDVM67');
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-gray-100`}>
        <div className="min-h-screen">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
