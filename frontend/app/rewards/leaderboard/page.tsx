import { NewLeaderboard } from '@/components/rewards/NewLeaderboard'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata = {
  title: 'SENTINEL Token Leaderboard | Sui Sentinel',
  description: 'Top SENTINEL token earners in the Sui Sentinel ecosystem. Ranked by total tokens earned through missions and on-chain activity.',
  openGraph: {
    title: 'SENTINEL Token Leaderboard | Sui Sentinel',
    description: 'Top SENTINEL token earners in the Sui Sentinel ecosystem.',
    url: `${SUI_SENTINEL_APP_URL}rewards/leaderboard`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rewards/leaderboard/og`,
        width: 1200,
        height: 630,
        alt: 'Leaderboard Snapshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SENTINEL Token Leaderboard | Sui Sentinel',
    description: 'Top SENTINEL token earners in the Sui Sentinel ecosystem.',
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rewards/leaderboard/og`,
  },
}

export default function Leaderboard() {
  return <NewLeaderboard />
}
