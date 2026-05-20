'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, CheckCircle, LogOut, ChevronDown, User, ArrowLeftRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { SUI_SENTINEL_DOCS_URL } from '@/constants'

type Props = {
  address: string
  rawAddress: string
  balanceLabel: string
  isLoadingBalance: boolean
  onDisconnect: () => void
}

export function WalletDropdown({ address, rawAddress, balanceLabel, isLoadingBalance, onDisconnect }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(rawAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-[var(--color-border-default)] px-3 py-1.5 text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]">
          <Image width={31} height={31} src="/icons/wallet.png" alt="wallet icon" />
          <span className="text-sm font-medium">{address}</span>
          <ChevronDown className="h-4 w-4 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-2 text-[var(--color-text-primary)] shadow-xl sm:w-72"
        align="end"
      >
        <DropdownMenuLabel className="px-2 pt-2 text-lg font-bold text-[var(--color-text-primary)]">
          My Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium text-[var(--color-text-secondary)]">Balance</div>
          <span className="text-base font-bold text-[var(--color-text-primary)]">
            {isLoadingBalance ? <Skeleton className="h-5 w-24" /> : balanceLabel}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />

        <Link href="/profile">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-[var(--color-bg-subtle)]">
            <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text-primary)]">Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href={`${SUI_SENTINEL_DOCS_URL}guides/bridging-funds`} target="_blank">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-[var(--color-bg-subtle)]">
            <ArrowLeftRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="text-[var(--color-text-primary)]">Bridge Funds</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="h-4 w-4 text-[var(--color-text-secondary)]" />
          )}
          <span className="text-[var(--color-text-primary)]">Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onDisconnect}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)] focus:bg-[var(--color-danger-muted)] focus:text-[var(--color-danger)]"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
