'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { OfferingsSection } from '@/components/sections/OfferingsSection'
import { TweetsSection } from '@/components/sections/TweetsSection'
import { AnimationSection } from '@/components/sections/AnimationSection'
import { VulnerabilitySection } from '@/components/sections/VulnerabilitySection'
import { EarnWhileDefendingSection } from '@/components/sections/EarnWhileDefendingSection'
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <div className="">
        <div className="px-4 md:px-10">
          <AnimationSection />
        </div>
        <VulnerabilitySection />
        <HowItWorksSection />
        <OfferingsSection />
      </div>
      <TweetsSection />

      <div className="px-4 md:px-10">
        <EarnWhileDefendingSection />
      </div>
      <WhyChooseUsSection />
    </>
  )
}
