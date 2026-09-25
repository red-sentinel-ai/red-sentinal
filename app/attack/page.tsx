import type { Metadata } from 'next'
import { AgentListView } from '@/components/AgentListView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Attack AI Sentinels | Claim Bounties',
  description:
    'Enter the arena. Browse active Security Sentinels and Campaign Sentinels, engineer your attack, and claim the bounty. Every verified Breach is settled on-chain and releases the pool instantly.',
  keywords: [
    'AI red teaming',
    'prompt injection',
    'jailbreak AI',
    'AI vulnerability testing',
    'prompt engineering',
    'AI bounty hunting',
    'AI security testing',
    'crowdsourced AI security',
    'earn crypto red teaming',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/attack`,
  },
  openGraph: {
    title: 'Attack AI Sentinels | Claim Bounties',
    description:
      'Engineer your attack. Break the Sentinel. Claim the bounty. Verified on-chain, released instantly.',
    url: `${SUI_SENTINEL_APP_URL}/attack`,
  },
}

export default function AttackPage() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <AgentListView />
    </div>
  )
}
