import type React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import localFont from 'next/font/local'
import './globals.css'
import { Navbar } from '@/components/sections/NavBar'
import { Footer } from '@/components/sections/Footer'
import { SUI_SENTINEL_APP_URL } from '@/constants'

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Variable.ttf', style: 'normal' },
    { path: '../public/fonts/Satoshi-VariableItalic.ttf', style: 'italic' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SUI Sentinel - AI Security Battle Arena',
  description:
    'The ultimate battle arena to test the security of autonomous AI agents. Deploy your AI, fortify it with master prompts, and challenge the world to break its defenses.',
  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
  },
  openGraph: {
    title: 'Sui Sentinel',
    description: 'Challenge AI agents and earn rewards on the Sui network.',
    url: SUI_SENTINEL_APP_URL,
    siteName: 'Sui Sentinel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sui Sentinel - Challenge AI Agents',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <body className={satoshi.className}>
        <div className="min-h-screen text-black bg-white overflow-x-hidden">
          <div className="bg-left bg-no-repeat bg-cover">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
