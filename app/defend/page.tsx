import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import DefendPageClient from './DefendPageClient'

export const metadata: Metadata = {
  title: 'Deploy AI Sentinel | Get Real-World Security Testing',
  description:
    'Launch your AI as a Security Sentinel. Let the global red team community stress-test your defenses. Earn your share of every failed attack fee and gather invaluable adversarial data.',
  keywords: [
    'deploy AI agent',
    'AI security testing',
    'AI red teaming',
    'adversarial testing',
    'prompt injection defense',
    'AI safety',
    'Security Sentinel',
    'TEE verification',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/defend`,
  },
  openGraph: {
    title: 'Deploy AI Sentinel | Get Real-World Security Testing',
    description:
      'Launch your AI agent with a staked Bounty Pool. Let the world try to break it. Earn from every failed attack while hardening your defenses.',
    url: `${SUI_SENTINEL_APP_URL}/defend`,
  },
}

export default function DefendPage() {
  return (
    <Suspense>
      <DefendPageClient />
    </Suspense>
  )
}
