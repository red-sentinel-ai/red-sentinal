import type { Metadata } from 'next'
import { EarnHero } from '@/components/earn/EarnHero'
import { StickyTabNav } from '@/components/earn/StickyTabNav'
import { HowItWorksSection } from '@/components/earn/HowItWorks/HowItWorksSection'
import { SocialMissionsSection } from '@/components/earn/SocialMissions/SocialMissionsSection'
import { PlatformRewardsSection } from '@/components/earn/PlatformRewards/PlatformRewardsSection'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Earn SENTINEL Tokens | Complete Missions & Spin Rewards',
  description:
    'Complete social missions, attack Sentinels, create content, and spin the slot machine to earn SENTINEL tokens. Comprehensive guide to the Sui Sentinel reward system.',
  keywords: [
    'SENTINEL token',
    'crypto rewards',
    'booster rewards',
    'SUI ecosystem',
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

export default function EarnPage() {
  return (
    <div className="min-h-body">
      <EarnHero />
      <StickyTabNav />
      <HowItWorksSection />
      <SocialMissionsSection />
      <PlatformRewardsSection />
    </div>
  )
}
