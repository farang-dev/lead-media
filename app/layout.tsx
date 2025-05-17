import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Unmanned Newsroom',
  description: 'Latest tech and AI news, automatically curated',
  openGraph: {
    title: 'Unmanned Newsroom',
    description: 'Latest tech and AI news, automatically curated',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Unmanned Newsroom',
    description: 'Latest tech and AI news, automatically curated'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
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
