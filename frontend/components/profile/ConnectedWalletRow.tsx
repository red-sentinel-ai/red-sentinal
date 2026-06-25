'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Copy } from 'lucide-react'

import { cn, truncateAddress } from '@/lib/utils'
import { resolveWalletChain } from '@/constants/chains'
import type { ConnectedWallet } from '@/types/Profile'

interface ConnectedWalletRowProps {
  wallet: ConnectedWallet
}

export function ConnectedWalletRow({ wallet }: ConnectedWalletRowProps) {
  const [copied, setCopied] = useState(false)
  const chain = resolveWalletChain(wallet.chainType, wallet.chainId)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            'flex size-5 shrink-0 overflow-hidden',
            chain.rounded && 'rounded-full'
          )}
        >
          <Image
            src={chain.logo}
            alt={chain.name}
            width={20}
            height={20}
            className="object-contain"
          />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
            {chain.name}
          </span>
          <span className="truncate font-mono text-xs font-bold text-[var(--color-text-primary)]">
            {truncateAddress(wallet.address)}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="shrink-0 text-[var(--color-text-muted)] opacity-50 transition-opacity hover:opacity-100"
        aria-label={`Copy ${chain.name} wallet address`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}
