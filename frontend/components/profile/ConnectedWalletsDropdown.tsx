'use client'

import { ChevronDown, Wallet } from 'lucide-react'

import { ConnectedWalletRow } from './ConnectedWalletRow'
import type { ConnectedWallet } from '@/types/Profile'

interface ConnectedWalletsDropdownProps {
  wallets: ConnectedWallet[]
}

export function ConnectedWalletsDropdown({ wallets }: ConnectedWalletsDropdownProps) {
  if (wallets.length === 0) return null

  return (
    <div className="group relative">
      <button
        type="button"
        className="button-ghost-terminal flex items-center gap-2 px-4 py-2"
      >
        <Wallet className="h-3.5 w-3.5" />
        <span>See All Connected Wallets</span>
        <span className="text-[var(--color-text-muted)]">({wallets.length})</span>
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>

      <div className="invisible absolute right-0 top-full z-20 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-72 divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] shadow-xl">
          {wallets.map(wallet => (
            <ConnectedWalletRow key={wallet.address} wallet={wallet} />
          ))}
        </div>
      </div>
    </div>
  )
}
