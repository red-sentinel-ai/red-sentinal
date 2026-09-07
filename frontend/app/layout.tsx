import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'
import localFont from 'next/font/local'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'

import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from './providers'
import { FloatingHelpButton } from '@/components/FloatingHelpButton'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_USERNAME, SUI_SENTINEL_GITHUB_URL } from '@/constants'

const inter = localFont({
  src: '../public/fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#100f0f',
}

export const metadata: Metadata = {
  metadataBase: new URL(SUI_SENTINEL_APP_URL),

  title: {
    default: 'Red Sentinel | The Ultimate AI Security Arena',
    template: '%s | Red Sentinel',
  },
  description:
    'Red Sentinel is a real-stakes AI security arena. Attack live Sentinels, learn how AI agents fail, earn real bounties, and build on-chain proof of skill.',

  keywords: [
    'AI Security Literacy',
    'AI Security Training',
    'AI Security Arena',
    'AI Red Teaming',
    'AI Safety',
    'AI Agents',
    'AI Agent Security',
    'AI Agent Safety',
    'LLM Security',
    'Prompt Injection',
    'Prompt Injection Training',
    'Jailbreak AI',
    'AI Jailbreak',
    'Adversarial AI',
    'AI Vulnerability',
    'AI Threat Education',
    'AI Security Education',
    'AI Penetration Testing',
    'AI Bounty Platform',
    'Bug Bounty AI',
    'Crowdsourced Security',
    'Real-Stakes AI Security',
    'On-Chain Verification',
    'Verifiable Credentials',
    'Blockchain AI Security',
    'Web3 AI',
    'Decentralized AI',
    'Sui Blockchain',
    'Sui Network',
    'Solana',
    'Solana Blockchain',
    'SUI Rewards',
    'USDC Rewards',
    'TEE',
    'Trusted Execution Environment',
    'Prompt Engineering',
  ],

  icons: {
    icon: '/icons/pwa-192x192.png',
    shortcut: '/icons/pwa-192x192.png',
    apple: '/icons/pwa-192x192.png',
  },

  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Red Sentinel',
  },

  openGraph: {
    title: 'Red Sentinel | The Ultimate AI Security Arena',
    description:
      'AI agents will manage money, data, and decisions. Red Sentinel helps you learn AI security by attacking live Sentinels, competing for real bounties, and proving skill on-chain.',
    url: SUI_SENTINEL_APP_URL,
    siteName: 'Red Sentinel',
    images: [
      {
        url: '/og-image-v6.png',
        width: 1200,
        height: 630,
        alt: 'Red Sentinel - The Ultimate AI Security Arena',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Red Sentinel | Break AI Agents. Take the Bounty pool.',
    description:
      'Attack live AI Sentinels, learn how agents fail, earn real bounties for verified exploits, and build on-chain proof of skill.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v6.png'],
  },

  alternates: {
    canonical: SUI_SENTINEL_APP_URL,
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

  authors: [{ name: 'Red Sentinel', url: SUI_SENTINEL_APP_URL }],
  creator: 'Red Sentinel',
  publisher: 'Red Sentinel',
  category: 'Technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Red Sentinel',
    url: SUI_SENTINEL_APP_URL,
    logo: `${SUI_SENTINEL_APP_URL}/icons/logo-sm.svg`,
    sameAs: [`https://twitter.com/${SUI_SENTINEL_X_USERNAME}`, SUI_SENTINEL_GITHUB_URL],
    description:
      'AI security arena for the age of agents. Attack live Sentinels, learn how AI systems fail, earn real bounties for verified exploits, and build reputation on-chain.',
    foundingDate: '2025',
    areaServed: 'Global',
    knowsAbout: [
      'AI Security',
      'AI Red Teaming',
      'Blockchain',
      'Smart Contracts',
      'Prompt Engineering',
      'LLM Security',
      'TEE',
      'Trusted Execution Environment',
    ],
  }

  // Software Application Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Red Sentinel',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
    featureList: [
      'AI Security Training',
      'AI Security Arena',
      'AI Red Teaming',
      'Cryptographic Verification',
      'Instant On-Chain Settlement',
      'TEE-based Attack Verification',
      'Bounty Rewards in SUI/USDC',
      'Prompt Injection Testing',
      'Jailbreak Detection',
    ],
    url: SUI_SENTINEL_APP_URL,
    screenshot: `${SUI_SENTINEL_APP_URL}/og-image-v6.png`,
  }

  // WebSite Schema with Search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red Sentinel',
    url: SUI_SENTINEL_APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SUI_SENTINEL_APP_URL}/attack?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // FAQ Schema for common questions
  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Red Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Red Sentinel is a real-stakes AI security training arena for the age of agents. Users learn how AI systems fail by attacking and defending live AI Sentinels in adversarial challenges. Successful exploits, defenses, rewards, and reputation signals are verified on-chain.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I earn rewards on Red Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Attackers pay a small fee to challenge live AI Sentinels. If they discover a verified exploit, they earn an instant reward from the bounty pool. Failed attacks help grow the bounty pool and reward defenders, creating a real-stakes training loop where skill, persistence, and security judgment matter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is Red Sentinel on blockchain?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Blockchain gives Red Sentinel verifiable outcomes, transparent bounty pools, instant reward settlement, and portable reputation. Every mission, exploit, defense, and payout can be recorded on-chain, so users can prove what they completed and rewards can be distributed without relying on a central gatekeeper.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is AI red teaming?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI red teaming is the practice of testing AI systems for vulnerabilities by attempting to break their safety measures. This includes prompt injection attacks, jailbreaks, and adversarial prompts that can make AI leak data or perform unintended actions. Red Sentinel makes this process continuous, crowdsourced, and economically incentivized.',
        },
      },
    ],
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { ...organizationSchema, '@context': undefined },
      { ...softwareSchema, '@context': undefined },
      { ...websiteSchema, '@context': undefined },
      faqSchema,
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="apple-touch-icon" href="/icons/pwa-192x192.png" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} flex min-h-screen flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]`}
      >
        <Providers>
          <NextTopLoader color="#ffffff" showSpinner={false} />
          <main className="w-full flex-grow">{children}</main>
          {/* <Footer /> */}
          <FloatingHelpButton />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '0px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              },
            }}
            mobileOffset={{ top: 80, right: 16 }}
          />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
