'use client'

import { Swords } from 'lucide-react'

import type { PracticeSentinel } from '@/types/practice'
import { PracticeSentinelCard } from './PracticeSentinelCard'

interface PracticeSentinelGridProps {
  sentinels: PracticeSentinel[]
  emptyMessage: string
}

export function PracticeSentinelGrid({ sentinels, emptyMessage }: PracticeSentinelGridProps) {
  if (sentinels.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <Swords className="h-8 w-8 text-[var(--color-text-muted)] opacity-40" />
        <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sentinels.map(sentinel => (
        <PracticeSentinelCard key={sentinel.sentinel_id} sentinel={sentinel} />
      ))}
    </div>
  )
}
