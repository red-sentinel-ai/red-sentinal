'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PrizePoolHistory } from '@/hooks/agents/useAllAgents'

interface PrizePoolChangeDisplayProps {
  prizePoolHistory?: PrizePoolHistory | null
  variant?: 'list' | 'card'
}

export const PrizePoolChangeDisplay = ({
  prizePoolHistory,
  variant = 'list',
}: PrizePoolChangeDisplayProps) => {
  if (!prizePoolHistory || prizePoolHistory.history.length === 0) {
    return <span className="text-sm text-[var(--color-text-faint)]">-</span>
  }

  const percentage = prizePoolHistory.change7d.percentage ?? Infinity
  const isPositive = percentage >= 0

  const displayText = !isFinite(percentage) ? 'New' : `${Math.abs(percentage).toFixed(1)}%`

  const textSize = variant === 'card' ? 'text-[10px]' : 'text-xs'

  return (
    <div
      className={cn(
        'flex items-center font-medium',
        isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
        textSize
      )}
    >
      {isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{displayText}</span>
      {variant === 'card' && isFinite(percentage) && (
        <span className="ml-1 text-[10px] font-medium text-[var(--color-success)]">(7d)</span>
      )}
    </div>
  )
}
