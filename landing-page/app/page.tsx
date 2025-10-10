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
import { ParticleSphereAnimation } from '@/components/ParticleSphereAnimation'

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <div className="absolute z-10 pointer-events-none inset-0">
        <ParticleSphereAnimation />
      </div>

      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <VisionSection />
      <OfferingsSection />
      <PassiveIncomeSection />
      <WhyChooseUsSection />
      <TweetsSection />
      <Footer />
    </div>
  )
}
