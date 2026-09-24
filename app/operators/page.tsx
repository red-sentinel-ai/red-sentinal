import { PlayerDirectory } from '@/components/players/PlayerDirectory'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata = {
  title: 'Operators',
  description:
    'Browse every operator on Red Sentinel — their total attacks, bounties won, sentinels launched, and follower counts. Follow the players you want to track.',
  openGraph: {
    title: 'Operators',
    description:
      'Browse every operator on Red Sentinel — their total attacks, bounties won, sentinels launched, and follower counts.',
    url: `${SUI_SENTINEL_APP_URL}/operators`,
  },
}

export default function OperatorsPage() {
  return <PlayerDirectory />
}
