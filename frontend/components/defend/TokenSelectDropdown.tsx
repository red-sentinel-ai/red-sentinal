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
    <div className="flex flex-col gap-2">
      <label className="text-[20px] font-medium leading-tight text-black">
        Fee Token
      </label>
      <span className="text-[16px] font-normal text-[#5E5E5E]">
        Attackers pay this token as fee per message.
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className='mt-auto'>
          <button
            type="button"
            className="flex h-[56px] w-full items-center justify-between rounded-xl border border-[#5E5E5E] bg-white px-4 transition-colors hover:border-black focus:outline-none sm:h-[65px]"
          >
            <div className="flex items-center gap-3">
              <Image
                src={selected.icon}
                alt={selected.symbol}
                width={28}
                height={28}
                className="rounded-full"
              />
              <div className="text-left">
                <span className="block text-[16px] font-medium text-black">{selected.symbol}</span>
                <span className="block text-[12px] text-[#5E5E5E]">{selected.name}</span>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px]">
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
    </div>
  )
}
