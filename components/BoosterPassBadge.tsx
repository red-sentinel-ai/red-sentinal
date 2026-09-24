'use client'

import { BOOSTER_TIERS, getTierTextConfig } from '@/constants'
import { cn } from '@/lib/utils'

interface BoosterPassBadgeProps {
  tierKey: string
  mode?: 'preview' | 'received'
  className?: string
}

export function BoosterPassBadge({ tierKey, mode = 'received', className }: BoosterPassBadgeProps) {
  const tierData = BOOSTER_TIERS[tierKey as keyof typeof BOOSTER_TIERS]
  if (!tierData) return null

  const textColor = getTierTextConfig(tierData.name)
  const verb = mode === 'preview' ? "You'll receive" : 'You received'

  return (
    <p className={cn('text-sm text-[var(--color-text-secondary)]', className)}>
      🎁 {verb} a{' '}
      <span className={cn('font-bold', textColor)}>{tierData.name}</span> Spin Pass
    </p>
  )
}
