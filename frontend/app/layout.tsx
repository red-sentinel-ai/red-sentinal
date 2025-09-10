import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { IBM_Plex_Mono, Inter } from 'next/font/google'

import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_USERNAME } from '@/constants'

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
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
    icon: '/icons/shield.svg',
    shortcut: '/icons/shield.svg',
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
      <body className={`${ibmPlexMono.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          <NextTopLoader
            color="#FFFFFF"
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
