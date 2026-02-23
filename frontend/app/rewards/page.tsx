import type { Metadata } from 'next'
import { RewardsDashboard } from '@/components/rewards/RewardsDashboard'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Earn Rewards | SENTINEL Token Missions',
  description:
    'Complete missions, earn SENTINEL tokens, and climb the leaderboard. Get rewarded for attacking AI Sentinels, defending your agents, and growing the ecosystem.',
  keywords: [
    'SENTINEL token',
    'AI red team rewards',
    'crypto rewards',
    'SUI ecosystem',
    'blockchain gaming rewards',
    'AI security incentives',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}rewards`,
  },
  openGraph: {
    title: 'Earn Rewards | SENTINEL Token Missions',
    description:
      'Complete missions, earn SENTINEL tokens, and unlock exclusive perks. Every action in the ecosystem counts.',
    url: `${SUI_SENTINEL_APP_URL}rewards`,
  },
}

export default function RewardsPage() {
  return <RewardsDashboard />
}
