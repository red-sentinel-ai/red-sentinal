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
        <button className="flex items-center gap-2 rounded-full border border-[var(--color-text-primary)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-subtle)]">
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
        className="w-44 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-2 shadow-xl"
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
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-bg-subtle)]',
                isActive && 'bg-[var(--color-bg-subtle)]'
              )}
            >
              <Image
                src={chain.icon}
                alt={chain.name}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{chain.name}</span>
              {isActive && <Check className="h-4 w-4 text-[var(--color-text-primary)]" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
