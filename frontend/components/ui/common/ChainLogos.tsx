'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CHAINS } from '@/constants/chains'

interface ChainLogosProps {
  className?: string
}

export function ChainLogos({ className }: ChainLogosProps) {
  const duration = Object.keys(CHAINS).length * 1.5

  return (
    <div
      className={cn(
        'flex min-h-14 w-full flex-row flex-wrap items-end justify-center gap-5',
        className
      )}
    >
      {Object.values(CHAINS).map((chain, index) => (
        <div
          key={chain.name}
          title={chain.name}
          className={cn(
            'relative flex size-12 shrink-0 origin-bottom items-center justify-center overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]',
            chain.active && 'z-10'
          )}
          style={{
            animation: `chain-breathe ${duration}s ease-in-out infinite`,
            animationDelay: `${index * 1.5}s`,
          }}
        >
          {chain.rounded ? (
            <span className="flex size-8 shrink-0 overflow-hidden rounded-full">
              <Image
                src={chain.logo}
                alt={chain.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </span>
          ) : (
            <Image
              src={chain.logo}
              alt={chain.name}
              width={32}
              height={32}
              className="object-contain"
            />
          )}
        </div>
      ))}
    </div>
  )
}
