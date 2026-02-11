'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { PrizePoolHistory } from '@/hooks/agents/useAllAgents'

interface PrizePoolChangeDisplayProps {
  prizePoolHistory?: PrizePoolHistory | null
  variant?: 'list' | 'card'
}

export const PrizePoolChangeDisplay = ({
  prizePoolHistory,
  variant = 'list',
}: PrizePoolChangeDisplayProps) => {
  if (!prizePoolHistory || prizePoolHistory.history.length === 0) {
    return <span className="text-sm text-gray-400">-</span>
  }

  const percentage = prizePoolHistory.change7d.percentage ?? Infinity
  const isPositive = percentage >= 0

  const displayText = !isFinite(percentage) ? 'New' : `${Math.abs(percentage).toFixed(1)}%`

  const textSize = variant === 'card' ? 'text-[10px]' : 'text-xl'

  return (
    <div
      className={cn(
        'flex items-center font-medium',
        isPositive ? 'text-[#1FAD57]' : 'text-red-500',
        textSize
      )}
    >
      {isPositive ? (
        <ArrowUp
          className={clsx({
            'h-3 w-3': variant === 'card',
            'h-5 w-5': variant === 'list',
          })}
        />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{displayText}</span>
      {variant === 'card' && isFinite(percentage) && (
        <span className="ml-1 text-[10px] font-medium text-[#1FAD57]">(7d)</span>
      )}
    </div>
  )
}
