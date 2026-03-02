import { NewLeaderboard } from '@/components/rewards/NewLeaderboard'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata = {
  title: 'Leaderboard | Sui Sentinel',
  description:
    'Rankings for the top defenders and attackers on Sui Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won — all verified on-chain.',
  openGraph: {
    title: 'Leaderboard | Sui Sentinel',
    description:
      'Rankings for the top defenders and attackers on Sui Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won — all verified on-chain.',
    url: `${SUI_SENTINEL_APP_URL}leaderboard`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard/og`,
        width: 1200,
        height: 630,
        alt: 'Sui Sentinel Leaderboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaderboard | Sui Sentinel',
    description:
      'Rankings for the top defenders and attackers on Sui Sentinel. See who has the most resilient AI Sentinels, the most breaches, and the biggest bounties won, all verified on-chain.',
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard/og`,
  },
}

export default function Leaderboard() {
  return <NewLeaderboard />
}
