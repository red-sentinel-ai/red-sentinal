import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import localFont from 'next/font/local'
import 'react-toastify/dist/ReactToastify.css'

import './globals.css'
import { Providers } from './providers'
import Footer from '@/components/Footer'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_USERNAME, SUI_SENTINEL_GITHUB_URL } from '@/constants'

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
    default: 'Sui Sentinel | Crowdsourced AI Red Teaming on Sui Blockchain',
    template: '%s | Sui Sentinel',
  },
  description:
    'The first crowdsource AI red teaming platform. Attack AI systems, earn SUI/USDC rewards instantly. Deploy Sentinels, get real-world security testing. Every attack verified cryptographically on-chain.',

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
    'Sui Network',
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
    'Blockchain Security',
    'Cryptoeconomic Security',
  ],

  icons: {
    icon: '/icons/logo-sm.svg',
    shortcut: '/icons/logo-sm.svg',
    apple: '/icons/logo-sm.svg',
  },

  openGraph: {
    title: 'Sui Sentinel | Ship AI Agents Without Fear',
    description:
      'Crowdsourced AI red teaming platform. Test AI defenses against real attacks, earn instant rewards. Every exploit verified cryptographically on Sui.',
    url: SUI_SENTINEL_APP_URL,
    siteName: 'Sui Sentinel',
    images: [
      {
        url: '/og-image-v4.png',
        width: 1200,
        height: 630,
        alt: 'Sui Sentinel - Crowdsourced AI Red Teaming Platform on Sui',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Sui Sentinel | Break AI, Earn Crypto, Make Systems Safer',
    description:
      'The first crowdsource AI red teaming platform. Attack AI systems → get paid instantly in SUI/USDC. Deploy Sentinels → get battle-tested security.',
    creator: `@${SUI_SENTINEL_X_USERNAME}`,
    images: ['/og-image-v4.png'],
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

  authors: [{ name: 'Sui Sentinel', url: SUI_SENTINEL_APP_URL }],
  creator: 'Sui Sentinel',
  publisher: 'Sui Sentinel',
  category: 'Technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sui Sentinel',
    url: SUI_SENTINEL_APP_URL,
    logo: `${SUI_SENTINEL_APP_URL}/icons/logo-sm.svg`,
    sameAs: [`https://twitter.com/${SUI_SENTINEL_X_USERNAME}`, SUI_SENTINEL_GITHUB_URL],
    description: 'The first crowdsource AI red teaming platform on Sui blockchain',
    foundingDate: '2024',
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
      'Prompt Injection Testing',
      'Jailbreak Detection',
    ],
    url: SUI_SENTINEL_APP_URL,
    screenshot: `${SUI_SENTINEL_APP_URL}/og-image-v4.png`,
  }

  // WebSite Schema with Search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sui Sentinel',
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
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Sui Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sui Sentinel is a crowdsourced AI red teaming platform built on the Sui blockchain. Companies deploy AI systems as "Sentinels" and security researchers attempt to break them through adversarial attacks like prompt injection and jailbreaking. Successful exploits are verified cryptographically and rewarded instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I earn rewards on Sui Sentinel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'As an attacker (red teamer), pay per message to challenge Sentinels. Use your prompt engineering skills to jailbreak AI systems or extract sensitive information. Every verified successful attack pays instantly in SUI or USDC. As a defender, earn a share of attack fees while gathering valuable security data to improve your AI.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is Sui Sentinel on blockchain?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Blockchain enables trustless verification of attacks through TEE (Trusted Execution Environment) attestations and instant settlement of rewards. Neither party can dispute outcomes or delay payments — the protocol enforces everything transparently on-chain. This is impossible with traditional Web2 platforms.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is AI red teaming?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI red teaming is the practice of testing AI systems for vulnerabilities by attempting to break their safety measures. This includes prompt injection attacks, jailbreaks, and adversarial prompts that can make AI leak data or perform unintended actions. Sui Sentinel makes this process continuous, crowdsourced, and economically incentivized.',
        },
      },
    ],
  }

  return (
    <html lang="en">
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
      <body
        className={`${satoshi.className} bg-no-repeat text-black`}
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
          <main className="flex-grow">{children}</main>
          <Footer />
          <ToastContainer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
