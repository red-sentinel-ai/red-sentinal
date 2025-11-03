'use client'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  return (
    <div className="min-h-body bg-[linear-gradient(90deg,#E9EFFF_0%,#FFFFFF_50%,#FFEBFD_100%)]">
      <div className="flex flex-col justify-center">
        <LandingPage />
      </div>
    </div>
  )
}
