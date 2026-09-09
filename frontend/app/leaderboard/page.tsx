import { NewLeaderboard } from '@/components/rewards/NewLeaderboard'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata = {
  title: 'Leaderboard',
  description:
    'Rankings for the top defenders and attackers on Red Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won — all verified on-chain.',
  openGraph: {
    title: 'Leaderboard',
    description:
      'Rankings for the top defenders and attackers on Red Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won — all verified on-chain.',
    url: `${SUI_SENTINEL_APP_URL}/leaderboard`,
    images: [
      {
        url: `${SUI_SENTINEL_APP_URL}/api/leaderboard/og`,
        width: 1200,
        height: 630,
        alt: 'Red Sentinel Leaderboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaderboard',
    description:
      'Rankings for the top defenders and attackers on Red Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won, all verified on-chain.',
    images: `${SUI_SENTINEL_APP_URL}/api/leaderboard/og`,
  },
}

export default function Leaderboard() {
  return <NewLeaderboard />
}
