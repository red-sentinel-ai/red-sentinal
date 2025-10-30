'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { VisionSection } from '@/components/sections/VisionSection'
import { OfferingsSection } from '@/components/sections/OfferingsSection'
import { PassiveIncomeSection } from '@/components/sections/PassiveIncomeSection'
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection'
import { TweetsSection } from '@/components/sections/TweetsSection'
import { Footer } from '@/components/sections/Footer'
import { Navbar } from '@/components/sections/NavBar'
import { AnimationSection } from '@/components/sections/AnimationSection'
import { VulnerabilitySection } from '@/components/sections/VulnerabilitySection'

export default function LandingPage() {
  return (
    <div className="min-h-screen text-black bg-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <div className="">
        <div className="px-4 md:px-10">
          <AnimationSection />
          <VulnerabilitySection />
        </div>
        <HowItWorksSection />
        <div className="px-4 md:px-10">
          <OfferingsSection />
          <VisionSection />
          <PassiveIncomeSection />
          <WhyChooseUsSection />
        </div>
      </div>
      <TweetsSection />

      <Footer />
    </div>
  )
}
