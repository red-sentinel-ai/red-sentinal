import type { Metadata } from 'next'
import { AgentListView } from '@/components/AgentListView'
import { JapaneseThemeBackground } from '@/components/JapaneseThemeBackground'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Attack AI Sentinels | Claim Bounties on Sui',
  description:
    'Enter the arena. Browse active AI Sentinels, engineer your attack, and claim the bounty. Every successful breach is verified on-chain and pays out instantly on Sui.',
  keywords: [
    'AI red teaming',
    'prompt injection',
    'jailbreak AI',
    'AI vulnerability testing',
    'prompt engineering',
    'AI bounty hunting',
    'Sui blockchain rewards',
    'AI security testing',
    'crowdsourced AI security',
    'earn crypto red teaming',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/attack`,
  },
  openGraph: {
    title: 'Attack AI Sentinels | Claim Bounties on Sui',
    description:
      'Engineer your attack. Break the Sentinel. Claim the bounty. Verified on-chain, paid instantly on Sui.',
    url: `${SUI_SENTINEL_APP_URL}/attack`,
  },
}

export default function AttackPage() {
  return (
    <JapaneseThemeBackground>
      <div className="relative z-10 mx-auto max-w-[1560px] px-2 py-4 md:px-8 md:py-16">
        <AgentListView />
      </div>
    </JapaneseThemeBackground>
  )
}
