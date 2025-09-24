import { RewardsLeaderboard } from '@/components/rewards/RewardsLeaderboard'

export const metadata = {
  title: 'Sui Sentinel Leaderboard',
  description: 'Top performers in the Sui Sentinel',
  openGraph: {
    title: 'Sui Sentinel Leaderboard',
    description: 'Top performers in the Sui Sentinel',
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
    title: 'Sui Sentinel Leaderboard',
    description: 'Top performers in the Sui Sentinel',
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/api/rewards/leaderboard/og`,
  },
}

export default function Leaderboard() {
  return (
    <div className="p-6 container mx-auto">
      <RewardsLeaderboard pointsSymbol={'SNTL'} />
    </div>
  )
}
