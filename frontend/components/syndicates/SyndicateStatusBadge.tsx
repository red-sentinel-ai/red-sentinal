'use client'

import { cn } from '@/lib/utils'

interface SyndicateStatusBadgeProps {
  status: 'active' | 'inactive' | null
}

export function SyndicateStatusBadge({ status }: SyndicateStatusBadgeProps) {
  const isActive = status === 'active'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        isActive
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isActive ? 'animate-pulse bg-green-400' : 'bg-[var(--color-text-muted)]'
        )}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
