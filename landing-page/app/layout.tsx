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
  title: 'Red Sentinel | AI Security Literacy for the Age of Agents',
  description:
    'Red Sentinel is a real-stakes AI security arena. Attack live Sentinels, learn how AI agents fail, earn real bounties, and build on-chain proof of skill.',

  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
  },
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
  openGraph: {
    title: 'Red Sentinel | AI Security Literacy for the Age of Agents',
    description:
      'AI agents will manage money, data, and decisions. Red Sentinel helps you learn AI security by attacking live Sentinels, competing for real bounties, and proving skill on-chain.',
    url: SUI_SENTINEL_LANDING_PAGE_URL,
    siteName: 'Red Sentinel',
    images: [
      {
        url: '/og-image-v6.png',
        width: 1200,
        height: 630,
        alt: 'Red Sentinel - AI Security Literacy for the Age of Agents',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Sentinel | The Ultimate AI Security Arena',
    description:
      'Attack live AI Sentinels, learn how agents fail, earn real bounties for verified exploits, and build on-chain proof of skill.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v6.png'],
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
    name: 'Red Sentinel',
    url: SUI_SENTINEL_LANDING_PAGE_URL,
    logo: `${SUI_SENTINEL_LANDING_PAGE_URL}/icons/logo-sm.svg`,
    sameAs: [`https://twitter.com/${SUI_SENTINEL_X_USERNAME}`, SUI_SENTINEL_GITHUB_URL],
    description:
      'AI security arena for the age of agents. Attack live Sentinels, learn how AI systems fail, earn real bounties for verified exploits, and build reputation on-chain.',
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
      'AI Red Teaming',
      'Cryptographic Verification',
      'Instant On-Chain Settlement',
      'TEE-based Attack Verification',
      'Bounty Rewards in Real Value Tokens',
    ],
    url: SUI_SENTINEL_APP_URL,
    screenshot: `${SUI_SENTINEL_LANDING_PAGE_URL}/og-image-v6.png`,
  }

  // WebSite Schema with Search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red Sentinel',
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
