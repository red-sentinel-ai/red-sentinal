'use client'

import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import { CHAINS, type SupportedChain } from '@/constants/chains'
import { useActiveChain } from '@/context/ActiveChainContext'

interface ChainMismatchBannerProps {
  agentChain: SupportedChain
  variant?: 'block' | 'inline'
  message?: string
}

export function ChainMismatchBanner({
  agentChain,
  variant = 'block',
  message,
}: ChainMismatchBannerProps) {
  const { setActiveChain } = useActiveChain()
  const target = CHAINS[agentChain]

  const defaultMessage =
    variant === 'block'
      ? `This sentinel lives on ${target.name}. Switch to ${target.name} to attack it.`
      : `This sentinel lives on ${target.name}.`

  return (
    <div
      className={
        variant === 'block'
          ? 'border-t border-amber-500/20 bg-amber-900/15 p-4'
          : 'flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-900/15 px-3 py-2 text-xs'
      }
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className={variant === 'block' ? 'text-sm font-medium' : 'text-xs font-medium'}>
            {message ?? defaultMessage}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveChain(agentChain)}
          className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-900/30"
        >
          <Image
            src={target.icon}
            alt={target.name}
            width={14}
            height={14}
            className="rounded-full"
          />
          Switch to {target.name}
        </button>
      </div>
    </div>
  )
}
