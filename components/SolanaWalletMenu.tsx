'use client'

import { type ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useSolanaWalletList } from '@/hooks/useSolanaWallet'

/**
 * "Connect Wallet" menu for Solana — lists every detected browser wallet
 * (Phantom, Solflare, Backpack, Glow). Selecting an installed one connects;
 * uninstalled ones open the wallet's install page. Wrap any button as `trigger`.
 */
export function SolanaWalletMenu({
  trigger,
  align = 'end',
}: {
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  const { wallets, select, connecting } = useSolanaWalletList()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="z-[110] w-60 rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-1.5 text-[var(--color-text-secondary)] shadow-[var(--shadow-elevated)]"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
          Connect a Solana Wallet
        </DropdownMenuLabel>
        {wallets.map(wallet =>
          wallet.installed ? (
            <DropdownMenuItem
              key={wallet.name}
              disabled={connecting}
              onClick={() => select(wallet.name)}
              className="flex cursor-pointer items-center gap-2.5 rounded-none px-2 py-2 text-sm transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- adapter icons are data URIs */}
              <img src={wallet.icon} alt="" className="h-5 w-5 rounded" />
              <span className="text-[var(--color-text-primary)]">{wallet.name}</span>
              {connecting && (
                <span className="ml-auto text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                  Connecting…
                </span>
              )}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={wallet.name}
              asChild
              className="flex cursor-pointer items-center gap-2.5 rounded-none px-2 py-2 text-sm transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06]"
            >
              <a href={wallet.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- adapter icons are data URIs */}
                <img src={wallet.icon} alt="" className="h-5 w-5 rounded opacity-40 grayscale" />
                <span>{wallet.name}</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                  Install
                </span>
              </a>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
