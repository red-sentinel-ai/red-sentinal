'use client'

import { ExternalLink, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { SUIVISION_TXBLOCK_URL } from '@/constants'
import type { SpinHistoryItem } from '@/types'

interface SpinHistoryProps {
  spins: SpinHistoryItem[]
  isLoading?: boolean
}

export const SpinHistory = ({ spins, isLoading }: SpinHistoryProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    )
  }

  if (spins.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <Zap className="mx-auto mb-2 h-10 w-10 text-gray-400" />
        <p className="text-gray-600">No spin history yet</p>
        <p className="text-sm text-gray-500">Spin a booster to see your history here</p>
      </div>
    )
  }

  // Show only the most recent spin
  const latestSpin = spins[0]

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Latest Spin</h3>
      {latestSpin && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl font-bold text-[#F632F3]">
                {latestSpin.finalAmount.toLocaleString()}
              </span>
              <span className="text-xs text-gray-600">SENTINEL</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
              <span>Base: {latestSpin.baseAmount}</span>
              <span>•</span>
              <span>{latestSpin.multiplier}x Multiplier</span>
              {latestSpin.streakBonus > 0 && (
                <>
                  <span>•</span>
                  <span className="text-orange-600">
                    <TrendingUp className="inline h-2.5 w-2.5" /> +{latestSpin.streakBonus}% Streak
                  </span>
                </>
              )}
              {latestSpin.luckyHourBonus > 0 && (
                <>
                  <span>•</span>
                  <span className="text-green-600">
                    🍀 +{latestSpin.luckyHourBonus}% Lucky Hour
                  </span>
                </>
              )}
              {latestSpin.shareBonus > 0 && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">
                    🐦 +{latestSpin.shareBonus} Share Bonus
                  </span>
                </>
              )}
            </div>

            <div className="mt-0.5 text-[10px] text-gray-400">
              {formatDistanceToNow(new Date(latestSpin.spunAt), { addSuffix: true })}
            </div>
          </div>

          <Link
            href={`${SUIVISION_TXBLOCK_URL}${latestSpin.transferDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
            title="View transaction"
          >
            <ExternalLink className="h-3.5 w-3.5 text-gray-600" />
          </Link>
        </div>
      )}
    </div>
  )
}
