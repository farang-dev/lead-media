import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

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
      <body className={`${inter.className} bg-gray-100`}>
        <div className="min-h-screen">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
