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
import { SupportedToken } from '@/constants'

interface TokenFilterDropdownProps {
  availableTokens: SupportedToken[]
  selectedCoinType: string | undefined
  onSelect: (coinType: string | undefined) => void
}

export function TokenFilterDropdown({
  availableTokens,
  selectedCoinType,
  onSelect,
}: TokenFilterDropdownProps) {
  if (availableTokens.length <= 1) return null

  const selectedToken = availableTokens.find(t => t.coinType === selectedCoinType)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto gap-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
        >
          {selectedToken ? (
            <>
              <Image
                src={selectedToken.icon}
                alt={selectedToken.symbol}
                width={16}
                height={16}
                className="rounded-full"
              />
              {selectedToken.symbol}
            </>
          ) : (
            'All Tokens'
          )}
          <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]">
        <DropdownMenuItem
          onClick={() => onSelect(undefined)}
          className={!selectedCoinType ? 'bg-[var(--color-bg-subtle)] font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}
        >
          All Tokens
        </DropdownMenuItem>
        {availableTokens.map(token => (
          <DropdownMenuItem
            key={token.coinType}
            onClick={() => onSelect(token.coinType)}
            className={selectedCoinType === token.coinType ? 'bg-[var(--color-bg-subtle)] font-medium text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}
          >
            <Image
              src={token.icon}
              alt={token.symbol}
              width={16}
              height={16}
              className="rounded-full"
            />
            {token.symbol}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
