import type { Metadata } from 'next'
import { RewardCalculatorContent } from './RewardCalculatorContent'

export const metadata: Metadata = {
  title: 'Reward Calculator | Defender Earnings | Red Sentinel',
  description:
    'Calculate your potential SUI and SENTINEL token rewards as a defender. See how much you can earn by deploying AI Sentinels with bounty pools. Launch your Sentinel and start earning from every attack attempt.',
  keywords: [
    'Red Sentinel rewards',
    'defender earnings calculator',
    'AI security rewards',
    'SENTINEL token',
    'SUI rewards',
    'bounty pool calculator',
    'AI sentinel earnings',
    'defender incentives',
    'red teaming rewards',
    'AI security bounty',
  ],
  openGraph: {
    title: 'Calculate Your Defender Rewards | Red Sentinel',
    description:
      'See how much SUI and SENTINEL tokens you can earn by deploying AI Sentinels. Bigger pools = bigger rewards.',
    url: 'https://redsentinel.xyz/reward-calculator',
    type: 'website',
  },
}

export default function RewardCalculatorPage() {
  return <RewardCalculatorContent />
}
