'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CHAINS } from '@/constants/chains'

interface ChainLogosProps {
  className?: string
}

export function ChainLogos({ className }: ChainLogosProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2', className)}>
      <span className="text-sm text-[var(--color-text-muted)]">Live on</span>
      {Object.values(CHAINS).map(chain => (
        <span
          key={chain.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-3 py-1.5"
        >
          {chain.rounded ? (
            <span className="flex size-4 shrink-0 overflow-hidden rounded-full">
              <Image
                src={chain.logo}
                alt={chain.name}
                width={16}
                height={16}
                className="object-contain"
              />
            </span>
          ) : (
            <Image
              src={chain.logo}
              alt={chain.name}
              width={16}
              height={16}
              className="object-contain"
            />
          )}
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {chain.name}
          </span>
        </span>
      ))}
    </div>
  )
}
