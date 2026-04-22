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
          <div key={i} className="h-8 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        ))}
      </div>
    )
  }

  if (spins.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[var(--color-border-default)] p-6 text-center">
        <Zap className="mx-auto mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">No spin history yet</p>
        <p className="text-xs text-[var(--color-text-muted)]">Spin a pass to see your history here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Spin History</h3>
      <div className="max-h-[200px] space-y-1.5 overflow-y-auto">
        {spins.map(spin => (
          <div
            key={spin._id}
            className="flex items-center justify-between rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-1 items-center gap-2">
              <span className="font-bold text-[var(--color-text-primary)]">{spin.finalAmount.toLocaleString()}</span>
              <span className="font-bold text-[var(--color-gold-primary)]">SENTINEL</span>
              <span className="text-[var(--color-text-faint)]">•</span>
              <span className="text-[var(--color-text-secondary)]">{spin.multiplier}x</span>
              {spin.streakBonus > 0 && (
                <>
                  <span className="text-[var(--color-text-faint)]">•</span>
                  <span className="text-[var(--color-warning)]">+{spin.streakBonus}%</span>
                </>
              )}
              {spin.luckyHourBonus > 0 && (
                <>
                  <span className="text-[var(--color-text-faint)]">•</span>
                  <span className="text-[var(--color-success)]">+{spin.luckyHourBonus}%</span>
                </>
              )}
              <span className="text-[var(--color-text-faint)]">•</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {formatDistanceToNow(new Date(spin.spunAt), { addSuffix: true })}
              </span>
            </div>

            <Link
              href={`${SUIVISION_TXBLOCK_URL}${spin.transferDigest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[var(--color-bg-subtle)] transition-colors hover:bg-[var(--color-border-subtle)]"
              title="View transaction"
            >
              <ExternalLink className="h-3 w-3 text-[var(--color-text-secondary)]" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
