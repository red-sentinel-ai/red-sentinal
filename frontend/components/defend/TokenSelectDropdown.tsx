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
          className="flex h-full items-center gap-2 px-3 hover:bg-gray-50 focus:outline-none"
        >
          <Image
            src={selected.icon}
            alt={selected.symbol}
            width={22}
            height={22}
            className="rounded-full"
          />
          <span className="text-[14px] font-medium text-black">{selected.symbol}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="max-h-[300px] min-w-[220px] overflow-y-auto">
        {tokens.map(token => (
          <DropdownMenuItem
            key={token.coinType}
            onClick={() => onSelect(token)}
            className="flex items-center justify-between px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <Image
                src={token.icon}
                alt={token.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div>
                <span className="block text-sm font-medium text-black">{token.symbol}</span>
                <span className="block text-xs text-[#5E5E5E]">{token.name}</span>
              </div>
            </div>
            {selected.coinType === token.coinType && (
              <Check className="h-4 w-4 shrink-0 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
