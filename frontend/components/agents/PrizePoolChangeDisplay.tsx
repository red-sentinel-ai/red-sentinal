'use client'

import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useAgentPrizePoolHistory } from '@/hooks/agents/useAgentPrizePoolHistory'

interface PrizePoolChangeDisplayProps {
  agentId: string
  variant?: 'list' | 'card'
}

export const PrizePoolChangeDisplay = ({ agentId, variant = 'list' }: PrizePoolChangeDisplayProps) => {
  const { data: prizePoolData, isLoading } = useAgentPrizePoolHistory(agentId)

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!prizePoolData || prizePoolData.history.length === 0) {
    return <span className="text-gray-400 text-sm">-</span>
  }

  const percentage = prizePoolData.change7d.percentage
  const isPositive = percentage >= 0
  
  const displayText = !isFinite(percentage) 
    ? 'New' 
    : `${Math.abs(percentage).toFixed(1)}%`

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
        <ArrowUp className={clsx(
        {
          "w-3 h-3": variant === "card",
          "w-5 h-5": variant === "list",
        }
      )} />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      <span>{displayText}</span>
      {variant === 'card' && isFinite(percentage) && (
        <span className="text-[10px] text-[#1FAD57] font-medium ml-1">(7d)</span>
      )}
    </div>
  )
}