'use client'

import Image from 'next/image'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type SupportedToken } from '@/constants'

interface TokenSelectDropdownProps {
  tokens: SupportedToken[]
  selected: SupportedToken
  onSelect: (token: SupportedToken) => void
}

export function TokenSelectDropdown({ tokens, selected, onSelect }: TokenSelectDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="font-body flex h-full items-center gap-2 px-3 text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-subtle)] focus:outline-none"
        >
          <Image
            src={selected.icon}
            alt={selected.symbol}
            width={14}
            height={14}
            className="rounded-full"
          />
          <span className="text-sm font-medium">{selected.symbol}</span>
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-h-[300px] min-w-[220px] overflow-y-auto border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
      >
        {tokens.map(token => (
          <DropdownMenuItem
            key={token.coinType}
            onClick={() => onSelect(token)}
            className="flex items-center justify-between px-3 py-2.5 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] focus:bg-[var(--color-bg-subtle)]"
          >
            <div className="flex items-center gap-2">
              <Image
                src={token.icon}
                alt={token.symbol}
                width={16}
                height={16}
                className="rounded-full"
              />
              <div>
                <span className="font-body block text-sm font-medium">{token.symbol}</span>
                <span className="font-body block text-xs text-[var(--color-text-muted)]">
                  {token.name}
                </span>
              </div>
            </div>
            {selected.coinType === token.coinType && (
              <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
