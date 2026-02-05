import type React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import localFont from 'next/font/local'
import './globals.css'
import { Navbar } from '@/components/sections/NavBar'
import { Footer } from '@/components/sections/Footer'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_USERNAME } from '@/constants'

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Variable.ttf', style: 'normal' },
    { path: '../public/fonts/Satoshi-VariableItalic.ttf', style: 'italic' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sui Sentinel | Decentralized AI safety platform built on Sui',
  description:
    'Decentralized AI security protocol on Sui. Test AI defenses, find vulnerabilities, claim bounties. Every judgment cryptographically verified on-chain.',
  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
  },
  keywords: [
    'Sui',
    'Sui Blockchain',
    'AI Agents',
    'AI Safety',
    'AI Security',
    'Red Teaming',
    'AI Red Teaming',
    'AI Vulnerability Hunting',
    'Cryptoeconomics',
    'Blockchain',
    'AI Alignment',
    'LLM',
    'Web3',
    'dApp',
    'Crypto Gaming',
    'Prompt Engineering',
  ],
  openGraph: {
    title: 'Sui Sentinel | Decentralized AI safety platform built on Sui',
    description:
      'Decentralized AI security protocol on Sui. Test AI defenses, find vulnerabilities, claim bounties. Every judgment cryptographically verified on-chain.',
    url: SUI_SENTINEL_APP_URL,
    siteName: 'Sui Sentinel',
    images: [
      {
        url: '/og-image-v4.png',
        width: 1200,
        height: 630,
        alt: 'Sui Sentinel | Gamified AI security platform on Sui',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sui Sentinel - Challenge AI Agents & Earn Rewards',
    description:
      'Outsmart AI agents on the Sui network and earn rewards for exposing their vulnerabilities.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v4.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
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
