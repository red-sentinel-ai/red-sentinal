'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { OfferingsSection } from '@/components/sections/OfferingsSection'
// import { TweetsSection } from '@/components/sections/TweetsSection'
import { AnimationSection } from '@/components/sections/AnimationSection'
import { VulnerabilitySection } from '@/components/sections/VulnerabilitySection'
import { EarnWhileDefendingSection } from '@/components/sections/EarnWhileDefendingSection'
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection'
import { AuditSection } from '@/components/sections/AuditSection'
import { ManifestoSection } from '@/components/sections/ManifestoSection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AnimationSection />
      <VulnerabilitySection />
      <HowItWorksSection />
      <OfferingsSection />
      <EarnWhileDefendingSection />
      <WhyChooseUsSection />
      <AuditSection />
      <ManifestoSection />
    </>
  )
}
