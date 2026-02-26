'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { OfferingsSection } from '@/components/sections/OfferingsSection'
import { AnimationSection } from '@/components/sections/AnimationSection'
import { VulnerabilitySection } from '@/components/sections/VulnerabilitySection'
import { EarnWhileDefendingSection } from '@/components/sections/EarnWhileDefendingSection'
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection'
import { AuditSection } from '@/components/sections/AuditSection'
import { ManifestoSection } from '@/components/sections/ManifestoSection'
import { SocialProofSection } from '@/components/sections/SocialProofSection'
import { DemoVideoSection } from '@/components/sections/DemoVideoSection'
import { DashboardPreviewSection } from '@/components/sections/DashboardPreviewSection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <AnimationSection />
      <VulnerabilitySection />
      <HowItWorksSection />
      <DemoVideoSection />
      <DashboardPreviewSection />
      <OfferingsSection />
      <EarnWhileDefendingSection />
      <WhyChooseUsSection />
      <AuditSection />
      <ManifestoSection />
    </>
  )
}
