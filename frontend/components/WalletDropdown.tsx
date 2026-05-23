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

export function WalletDropdown({
  address,
  rawAddress,
  balanceLabel,
  isLoadingBalance,
  onDisconnect,
}: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(rawAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex min-h-[34px] items-center gap-2 border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 py-1.5 text-[var(--color-gold-light)] transition-colors hover:border-[var(--color-gold-primary)] hover:bg-[rgba(255,176,0,0.08)]">
          <Image
            width={18}
            height={18}
            src="/icons/wallet.png"
            alt="wallet icon"
            className="h-[18px] w-[18px]"
          />
          <span className="font-mono text-xs font-bold uppercase">{address}</span>
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)] transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-1.5 text-[var(--color-text-secondary)] shadow-[var(--shadow-elevated)]"
        align="end"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          My Wallet
        </DropdownMenuLabel>

        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="text-sm text-[var(--color-text-muted)]">Balance</div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {isLoadingBalance ? <Skeleton className="h-4 w-20" /> : balanceLabel}
          </span>
        </div>

        <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />

        <Link href="/profile">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-none px-2 py-2 text-sm transition-colors hover:bg-[rgba(255,176,0,0.08)]">
            <User className="h-4 w-4 text-[var(--color-text-muted)]" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href={`${SUI_SENTINEL_DOCS_URL}guides/bridging-funds`} target="_blank">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-none px-2 py-2 text-sm transition-colors hover:bg-[rgba(255,176,0,0.08)]">
            <ArrowLeftRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            <span>Bridge Funds</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-2 rounded-none px-2 py-2 text-sm transition-colors hover:bg-[rgba(255,176,0,0.08)]"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
          <span>Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onDisconnect}
          className="flex cursor-pointer items-center gap-2 rounded-none px-2 py-2 text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)] focus:bg-[var(--color-danger-muted)] focus:text-[var(--color-danger)]"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
