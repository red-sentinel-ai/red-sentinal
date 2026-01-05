import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import localFont from 'next/font/local'
import 'react-toastify/dist/ReactToastify.css'

import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'
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
  metadataBase: new URL(SUI_SENTINEL_APP_URL),

  title: {
    default: 'Sui Sentinel | Decentralized AI safety platform built on Sui',
    template: '%s | Sui Sentinel',
  },
  description:
    'Decentralized AI security protocol on Sui. Test AI defenses, find vulnerabilities, claim bounties. Every judgment cryptographically verified on-chain.',

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

  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
  },

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
        alt: 'Sui Sentinel | Decentralized AI safety platform built on Sui',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Sui Sentinel - Gamified AI Security platform on Sui',
    description:
      'Outsmart AI agents on the Sui network and earn rewards for exposing their vulnerabilities.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v4.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${satoshi.className} text-black bg-no-repeat`}
        style={{
          backgroundImage: `
      url('/img/hero_bg.png'),
      linear-gradient(
        to right,
        rgba(233,239,255,0.55),
        rgba(245,245,245,0.55),
        rgba(255,235,253,0.55)
      )
    `,
          backgroundSize: '100% auto, 100% auto',
          backgroundRepeat: 'no-repeat, no-repeat',
          backgroundPosition: 'center top, center top',
        }}
      >
        <Providers>
          <NextTopLoader color="#000000" showSpinner={false} />
          <main className="flex-grow ">{children}</main>
          <Footer />
          <ToastContainer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
