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

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Spin History</h3>
      <div className="space-y-3">
        {spins.map(spin => (
          <div
            key={spin._id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl font-bold text-[#F632F3]">
                  {spin.finalAmount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">SENTINEL</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>Base: {spin.baseAmount}</span>
                <span>•</span>
                <span>{spin.multiplier}x Multiplier</span>
                {spin.streakBonus > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600">
                      <TrendingUp className="inline h-3 w-3" /> +{spin.streakBonus}% Streak
                    </span>
                  </>
                )}
                {spin.luckyHourBonus > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">
                      🍀 +{spin.luckyHourBonus}% Lucky Hour
                    </span>
                  </>
                )}
                {spin.shareBonus > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">
                      🐦 +{spin.shareBonus} Share Bonus
                    </span>
                  </>
                )}
              </div>

              <div className="mt-1 text-xs text-gray-400">
                {formatDistanceToNow(new Date(spin.spunAt), { addSuffix: true })}
              </div>
            </div>

            <Link
              href={`${SUIVISION_TXBLOCK_URL}${spin.transferDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
              title="View transaction"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
