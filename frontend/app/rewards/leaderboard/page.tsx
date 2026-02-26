import { Trophy, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

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
    <div className="min-h-body pb-12 pt-20">
      <div className="container mx-auto md:px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-2xl border border-gray-200 bg-gray-50/50 backdrop-blur-lg">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                <Trophy className="h-12 w-12 text-black" />
              </div>
              <h3 className="mb-3 text-2xl font-bold uppercase text-black">
                Leaderboard
              </h3>
              <p className="mx-auto max-w-md leading-relaxed text-gray-600">
                 The leaderboard is being reworked and will be back soon. Keep earning points. Your progress is saved.
              </p>
              <div className="mt-6">
                <span className="mx-auto flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
