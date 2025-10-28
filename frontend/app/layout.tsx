import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
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
    default: 'Sui Sentinel',
    template: '%s | Sui Sentinel',
  },
  description:
    'Challenge and outsmart sophisticated AI agents on the Sui network. Earn rewards by exposing their vulnerabilities. Are you ready to become a Sentinel?',

  keywords: [
    'Sui',
    'Sui Blockchain',
    'AI Agents',
    'LLM',
    'Web3',
    'dApp',
    'Crypto Gaming',
    'Prompt Engineering',
  ],

  icons: {
    icon: '/icons/shield.png',
    shortcut: '/icons/shield.png',
    // apple: '/icons/apple-touch-icon.png',
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

  twitter: {
    card: 'summary_large_image',
    title: 'Sui Sentinel - Challenge AI Agents & Earn Rewards',
    description:
      'Outsmart AI agents on the Sui network and earn rewards for exposing their vulnerabilities.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${satoshi.className} text-black`}>
        <Providers>
          <NextTopLoader
            color="#000000"
            showSpinner={false}
          />
          {children}
          <Footer />
          <ToastContainer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
