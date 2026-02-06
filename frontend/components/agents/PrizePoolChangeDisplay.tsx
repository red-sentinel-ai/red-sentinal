'use client'

import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useAgentPrizePoolHistory } from '@/hooks/agents/useAgentPrizePoolHistory'

interface PrizePoolChangeDisplayProps {
  agentId: string
  variant?: 'list' | 'card'
}

export const PrizePoolChangeDisplay = ({
  agentId,
  variant = 'list',
}: PrizePoolChangeDisplayProps) => {
  const { data: prizePoolData, isLoading } = useAgentPrizePoolHistory(agentId)

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!prizePoolData || prizePoolData.history.length === 0) {
    return <span className="text-sm text-gray-400">-</span>
  }

  const percentage = prizePoolData.change7d.percentage
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
