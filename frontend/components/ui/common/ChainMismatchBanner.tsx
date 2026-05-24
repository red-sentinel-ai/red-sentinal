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
          ? 'border-t border-[rgba(250,204,21,0.25)] bg-[rgba(26,25,25,0.96)] p-4'
          : 'flex items-center gap-2 border border-[rgba(250,204,21,0.25)] bg-[rgba(26,25,25,0.96)] px-3 py-2 text-xs'
      }
    >
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="flex items-center gap-2 text-[#fde047]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#facc15]" />
          <span className={variant === 'block' ? 'text-sm font-medium' : 'text-xs font-medium'}>
            {message ?? defaultMessage}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveChain(agentChain)}
          className="flex items-center gap-1.5 bg-[var(--color-text-primary)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-colors hover:opacity-90"
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
