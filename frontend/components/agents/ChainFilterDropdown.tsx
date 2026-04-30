'use client'

import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CHAINS, SUPPORTED_CHAINS, type SupportedChain } from '@/constants/chains'

interface ChainFilterDropdownProps {
  selectedChain: SupportedChain | undefined
  onSelect: (chain: SupportedChain | undefined) => void
}

export function ChainFilterDropdown({ selectedChain, onSelect }: ChainFilterDropdownProps) {
  const selected = selectedChain ? CHAINS[selectedChain] : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto gap-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
        >
          {selected ? (
            <>
              <Image
                src={selected.icon}
                alt={selected.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              {selected.name}
            </>
          ) : (
            'All Chains'
          )}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px] border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]"
      >
        <DropdownMenuItem
          onClick={() => onSelect(undefined)}
          className={
            !selectedChain
              ? 'bg-[var(--color-bg-subtle)] font-medium text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }
        >
          All Chains
        </DropdownMenuItem>
        {SUPPORTED_CHAINS.map(chainId => (
          <DropdownMenuItem
            key={chainId}
            onClick={() => onSelect(chainId)}
            className={
              selectedChain === chainId
                ? 'bg-[var(--color-bg-subtle)] font-medium text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }
          >
            <Image
              src={CHAINS[chainId].icon}
              alt={CHAINS[chainId].name}
              width={16}
              height={16}
              className="rounded-full"
            />
            {CHAINS[chainId].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
