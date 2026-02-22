import type React from 'react'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import localFont from 'next/font/local'
import './globals.css'
import { Navbar } from '@/components/sections/NavBar'
import { Footer } from '@/components/sections/Footer'
import { 
  SUI_SENTINEL_APP_URL, 
  SUI_SENTINEL_X_USERNAME,
  SUI_SENTINEL_LANDING_PAGE_URL,
  SUI_SENTINEL_GITHUB_URL,
} from '@/constants'

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Variable.ttf', style: 'normal' },
    { path: '../public/fonts/Satoshi-VariableItalic.ttf', style: 'italic' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sui Sentinel | Crowdsourced AI Red Teaming on Sui Blockchain',
  description:
    'The first trustless AI red teaming marketplace. Attack AI systems, earn SUI/USDC rewards instantly. Deploy Sentinels, get real-world security testing. Cryptographically verified on-chain.',
  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
  },
  keywords: [
    'AI Red Teaming',
    'AI Security',
    'AI Safety',
    'Prompt Injection',
    'Jailbreak AI',
    'AI Vulnerability',
    'Bug Bounty AI',
    'Crowdsourced Security',
    'Sui Blockchain',
    'Sui',
    'Web3 AI',
    'Decentralized AI',
    'AI Agents',
    'LLM Security',
    'AI Alignment',
    'Adversarial AI',
    'AI Penetration Testing',
    'Smart Contract Audit',
    'TEE',
    'Trusted Execution Environment',
    'On-Chain Verification',
    'Prompt Engineering',
    'AI Bounty Platform',
  ],
  openGraph: {
    title: 'Sui Sentinel | Ship AI Agents Without Fear',
    description:
      'Crowdsourced AI red teaming platform. Test AI defenses against real attacks, earn instant rewards. Every exploit verified cryptographically on Sui.',
    url: SUI_SENTINEL_LANDING_PAGE_URL,
    siteName: 'Sui Sentinel',
    images: [
      {
        url: '/og-image-v4.png',
        width: 1200,
        height: 630,
        alt: 'Sui Sentinel - Crowdsourced AI Red Teaming Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sui Sentinel | Break AI, Earn Crypto, Make Systems Safer',
    description:
      'The first trustless AI red teaming marketplace. Attack AI systems → get paid instantly in SUI/USDC. Deploy Sentinels → get battle-tested.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v4.png'],
  },
  alternates: {
    canonical: SUI_SENTINEL_LANDING_PAGE_URL,
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sui Sentinel',
    url: SUI_SENTINEL_LANDING_PAGE_URL,
    logo: `${SUI_SENTINEL_LANDING_PAGE_URL}/icons/logo-sm.svg`,
    sameAs: [
      `https://twitter.com/${SUI_SENTINEL_X_USERNAME}`,
      SUI_SENTINEL_GITHUB_URL,
    ],
    description: 'Crowdsourced AI red teaming platform on Sui blockchain',
    foundingDate: '2024',
    areaServed: 'Global',
    knowsAbout: [
      'AI Security',
      'AI Red Teaming',
      'Blockchain',
      'Smart Contracts',
      'Prompt Engineering',
    ],
  }

  // Software Application Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sui Sentinel',
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
      'AI Red Teaming',
      'Cryptographic Verification',
      'Instant On-Chain Settlement',
      'TEE-based Attack Verification',
      'Bounty Rewards in SUI/USDC',
    ],
    url: SUI_SENTINEL_APP_URL,
    screenshot: `${SUI_SENTINEL_LANDING_PAGE_URL}/og-image-v4.png`,
  }

  // WebSite Schema with Search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sui Sentinel',
    url: SUI_SENTINEL_LANDING_PAGE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SUI_SENTINEL_LANDING_PAGE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // FAQ Schema for common questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Sui Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sui Sentinel is a crowdsourced AI red teaming platform built on the Sui blockchain. Companies deploy AI systems as "Sentinels" and security researchers attempt to break them through adversarial attacks. Successful exploits are verified cryptographically and rewarded instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I earn rewards on Sui Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As an attacker, pay per message to challenge Sentinels. Use your prompt engineering skills to jailbreak AI systems or extract sensitive information. Every verified successful attack pays instantly in SUI or USDC. As a defender, earn a share of attack fees while gathering valuable security data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is Sui Sentinel on blockchain?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Blockchain enables trustless verification of attacks through TEE (Trusted Execution Environment) attestations and instant settlement of rewards. Neither party can dispute outcomes or delay payments — the protocol enforces everything transparently on-chain.',
        },
      },
    ],
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
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
