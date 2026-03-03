'use client'

import { useSpinFeed } from '@/hooks/rewards/useSpinFeed'
import { BOOSTER_TIERS } from '@/constants'
import { formatDistanceToNow } from 'date-fns'

export const SpinFeed = () => {
  const { data: feedData, isLoading } = useSpinFeed(30)

  if (isLoading || !feedData?.spins || feedData.spins.length === 0) {
    return (
      <div className="overflow-hidden border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Recent Spins:</span>
          <span className="text-xs text-gray-500">Loading recent spins...</span>
        </div>
      </div>
    )
  }

  // Duplicate the items to create seamless infinite scroll
  const items = [...feedData.spins, ...feedData.spins]

  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="flex-shrink-0 text-xs font-semibold text-gray-600">Recent Spins</span>

        <div className="relative flex-1 overflow-hidden">
          <div className="animate-scroll hover:pause-animation flex gap-8">
            {items.map((spin, index) => {
              const tierInfo = BOOSTER_TIERS[spin.tier as keyof typeof BOOSTER_TIERS]

              return (
                <div
                  key={`${spin.walletAddress}-${spin.spunAt}-${index}`}
                  className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap text-xs"
                >
                  <span className="font-medium text-gray-700">{spin.walletAddress}</span>
                  <span className="text-gray-400">•</span>
                  <span className={tierInfo?.textColor || 'text-gray-600'}>
                    {tierInfo?.name || spin.tier}
                  </span>
                  <span className="font-semibold text-[#F632F3]">{spin.multiplier}x</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-bold text-green-600">
                    {spin.finalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(spin.spunAt), { addSuffix: true })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
