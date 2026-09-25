import type { Metadata } from 'next'
import { EarnHero } from '@/components/earn/EarnHero'
import { StickyTabNav } from '@/components/earn/StickyTabNav'
import { HowItWorksSection } from '@/components/earn/HowItWorks/HowItWorksSection'
import { SocialMissionsSection } from '@/components/earn/SocialMissions/SocialMissionsSection'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Earn SENTINEL Tokens | Complete Missions & Spin Rewards',
  description:
    'Complete social missions, attack Sentinels, create content, and spin the slot machine to earn SENTINEL tokens. Comprehensive guide to the Red Sentinel reward system.',
  keywords: [
    'SENTINEL token',
    'crypto rewards',
    'booster rewards',
    'Sentinel rewards',
    'blockchain gaming rewards',
    'AI security incentives',
    'slot machine rewards',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/earn`,
  },
  openGraph: {
    title: 'Earn SENTINEL Tokens | Complete Missions & Spin Rewards',
    description:
      'Every action earns SENTINEL. Complete missions, attack Sentinels, and spin the slot machine for instant rewards.',
    url: `${SUI_SENTINEL_APP_URL}/earn`,
  },
}

// Components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _hidden = { EarnHero, StickyTabNav, HowItWorksSection, SocialMissionsSection }

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
        The rewards system is being upgraded. Check back soon.
      </p>
    </div>
  )
}
