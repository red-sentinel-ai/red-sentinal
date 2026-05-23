'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CHAINS } from '@/constants/chains'

interface ChainLogosProps {
  className?: string
}

export function ChainLogos({ className }: ChainLogosProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2 md:gap-3', className)}>
      <span className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
        Live on:
      </span>
      {Object.values(CHAINS).map(chain => (
        <span
          key={chain.name}
          className="inline-flex items-center gap-1.5 border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-gold-primary)]"
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
          <span>{chain.name}</span>
        </span>
      ))}
    </div>
  )
}
