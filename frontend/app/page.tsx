'use client'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  return (
    <div
      className="min-h-body bg-cover bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundPosition: '10% 15%',
      }}
    >
      <div className="flex flex-col justify-center">
        <LandingPage />
      </div>
    </div>
  )
}
