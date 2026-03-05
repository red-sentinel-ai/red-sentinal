'use client'

import { BOOSTER_TIERS } from '@/constants'
import { BoosterTierCard } from './BoosterTierCard'

export function BoosterTierRow() {
  const tiers = Object.values(BOOSTER_TIERS)

  return (
    <div className="relative">
      <h3 className="mb-4 text-center text-2xl font-bold uppercase text-black">
        Spin Pass Booster Tiers
      </h3>
      <p className="mb-6 text-center text-gray-600">
        Seven booster tiers from Common to Divine - higher tiers multiply your rewards
      </p>

      {/* Horizontal Scrollable Container */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <BoosterTierCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="mt-4 text-center text-sm text-gray-500 sm:hidden">
        ← Swipe to see all tiers →
      </div>
    </div>
  )
}
