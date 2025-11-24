'use client'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  return (
    <div className="min-h-body relative">
      <div className="flex flex-col justify-center">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <LandingPage />
      </div>
    </div>
  )
}
