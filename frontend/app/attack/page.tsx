import type { Metadata } from 'next'
import { AgentListView } from '@/components/AgentListView'
// import { ChainLogos } from '@/components/ui/common/ChainLogos'
import { SUI_SENTINEL_APP_URL } from '@/constants'

// const chains = [
//   { name: 'Solana', logo: '/chain-logos/sol.webp' },
//   { name: 'Monad', logo: '/chain-logos/mon.webp', rounded: true },
//   { name: 'Ethereum', logo: '/chain-logos/eth.webp' },
//   { name: 'Arbitrum', logo: '/chain-logos/arb.svg', active: true },
// ]

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
    <div className="relative min-h-[calc(100vh-60px)] flex-col items-end justify-center bg-[var(--color-bg-base)] md:mt-0 md:items-center md:px-4">
      {/* <div className="w-full max-w-4xl px-4 pt-8">
        <ChainLogos chains={chains} />
      </div> */}
      <AgentListView />
    </div>
  )
}
