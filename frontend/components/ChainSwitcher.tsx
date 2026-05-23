'use client'

import Image from 'next/image'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { useActiveChain } from '@/context/ActiveChainContext'
import { cn } from '@/lib/utils'

export function ChainSwitcher() {
  const { activeChain, setActiveChain } = useActiveChain()
  const active = CHAINS[activeChain]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex min-h-[34px] items-center gap-2 border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.02em] text-[var(--color-gold-light)] transition-colors hover:border-[var(--color-gold-primary)] hover:bg-[rgba(255,176,0,0.08)]">
          <Image
            src={active.icon}
            alt={active.name}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="hidden sm:inline">{active.name}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-44 rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-1.5 shadow-[var(--shadow-elevated)]"
        align="end"
      >
        {SUPPORTED_CHAINS.map(chainId => {
          const chain = CHAINS[chainId]
          const isActive = chainId === activeChain
          return (
            <DropdownMenuItem
              key={chainId}
              onClick={() => setActiveChain(chainId)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-none px-3 py-2 font-mono text-xs uppercase transition-colors hover:bg-[rgba(255,176,0,0.08)]',
                isActive && 'bg-[rgba(255,176,0,0.12)]'
              )}
            >
              <Image
                src={chain.icon}
                alt={chain.name}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="flex-1 font-bold text-[var(--color-text-primary)]">
                {chain.name}
              </span>
              {isActive && <Check className="h-4 w-4 text-[var(--color-gold-primary)]" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
