import type { Metadata } from 'next'
import { AgentListView } from '@/components/AgentListView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Attack AI Sentinels | Claim Bounties',
  description:
    'Enter the arena. Browse active AI Sentinels, engineer your attack, and claim the bounty. Every successful breach is verified on-chain and pays out instantly.',
  alternates: {
    canonical: SUI_SENTINEL_APP_URL,
  },
}

export default function Home() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <AgentListView />
    </div>
  )
}
