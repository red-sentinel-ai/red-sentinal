import type { Metadata } from 'next'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Sentinel Points | Red Sentinel Rewards',
  description:
    'Earn Sentinel Points by attacking Sentinels, launching Sentinels, funding defenses, and completing missions. Spin the slot machine to multiply your points — on every chain.',
  keywords: [
    'Sentinel Points',
    'loyalty rewards',
    'crypto rewards',
    'Sentinel rewards',
    'blockchain gaming rewards',
    'AI security incentives',
    'slot machine rewards',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/rewards`,
  },
  openGraph: {
    title: 'Sentinel Points | Red Sentinel Rewards',
    description:
      'Every action earns Sentinel Points. Attack, defend, launch, and spin — on every chain.',
    url: `${SUI_SENTINEL_APP_URL}/rewards`,
  },
}

export default function RewardsPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
        Coming Soon
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">
        Rewards
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        The rewards system is being upgraded. Check your profile&apos;s My Rewards
        tab for Sentinel Points and Spin Passes.
      </p>
    </div>
  )
}
