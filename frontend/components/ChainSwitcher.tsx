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
        <button className="font-body flex min-h-[34px] items-center gap-2 bg-[var(--color-bg-deepest)] px-1 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-70 md:text-[11px]">
          <Image
            src={active.icon}
            alt={active.name}
            width={20}
            height={20}
            className="rounded-full brightness-200"
          />
          <span className="hidden sm:inline">{active.name}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-44 rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-1.5 shadow-[var(--shadow-elevated)]"
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
                'font-body flex cursor-pointer items-center gap-3 rounded-none px-3 py-2 text-[10px] uppercase tracking-[0.1em] transition-colors hover:bg-white/[0.06]',
                isActive && 'bg-white/[0.08]'
              )}
            >
              <Image
                src={chain.icon}
                alt={chain.name}
                width={20}
                height={20}
                className="rounded-full brightness-200"
              />
              <span className="flex-1 font-bold text-[var(--color-text-primary)]">
                {chain.name}
              </span>
              {isActive && <Check className="h-4 w-4 text-white" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
