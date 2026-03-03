'use client'

import { ExternalLink, Zap } from 'lucide-react'
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
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    )
  }

  if (spins.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center">
        <Zap className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">No spin history yet</p>
        <p className="text-xs text-gray-500">Spin a pass to see your history here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Spin History</h3>
      <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
        {spins.map(spin => (
          <div
            key={spin._id}
            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-1 items-center gap-2">
              <span className="font-bold text-black">{spin.finalAmount.toLocaleString()}</span>
              <span className="font-bold text-[#F632F3]">SENTINEL</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{spin.multiplier}x</span>
              {spin.streakBonus > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-orange-600">+{spin.streakBonus}%</span>
                </>
              )}
              {spin.luckyHourBonus > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-600">+{spin.luckyHourBonus}%</span>
                </>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-[10px] text-gray-500">
                {formatDistanceToNow(new Date(spin.spunAt), { addSuffix: true })}
              </span>
            </div>

            <Link
              href={`${SUIVISION_TXBLOCK_URL}${spin.transferDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gray-100 transition-colors hover:bg-gray-200"
              title="View transaction"
            >
              <ExternalLink className="h-3 w-3 text-gray-600" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
