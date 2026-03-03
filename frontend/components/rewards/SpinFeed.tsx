'use client'

import { useState, useEffect } from 'react'
import { useSpinFeed } from '@/hooks/rewards/useSpinFeed'
import { BOOSTER_TIERS } from '@/constants'
import { formatDistanceToNow } from 'date-fns'

export const SpinFeed = () => {
  const { data: feedData, isLoading } = useSpinFeed(30)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!feedData?.spins || feedData.spins.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % feedData.spins.length)
    }, 5000) // Change entry every 5 seconds

    return () => clearInterval(interval)
  }, [feedData?.spins])

  if (isLoading || !feedData?.spins || feedData.spins.length === 0) {
    return (
      <div className="overflow-hidden border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Recent Spins:</span>
          <span className="text-xs text-gray-500">Loading recent spins...</span>
        </div>
      </div>
    )
  }

  const currentSpin = feedData.spins[currentIndex]
  const tierInfo = BOOSTER_TIERS[currentSpin.tier as keyof typeof BOOSTER_TIERS]

  return (
    <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="flex items-center justify-center gap-1 px-4 py-2.5">
        <div className="relative h-5 flex-1 overflow-hidden">
          <div
            key={currentIndex}
            className="animate-slide-up flex items-center justify-center gap-1.5 text-xs"
          >
            <span className="font-medium text-gray-700">{currentSpin.walletAddress}</span>
            <span className="text-gray-600">spun</span>
            <span className={`font-semibold ${tierInfo?.textColor || 'text-gray-600'}`}>
              {tierInfo?.name || currentSpin.tier} Pass
            </span>
            <span className="text-gray-600">and won</span>
            <span className="font-bold text-green-600">
              {currentSpin.finalAmount.toLocaleString()} SENTINEL
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-[10px] text-gray-500">
              {formatDistanceToNow(new Date(currentSpin.spunAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
