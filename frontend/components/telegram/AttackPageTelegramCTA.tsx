'use client'

import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { ConnectTelegramButton } from './ConnectTelegramButton'

type Props = {
  chain: 'sui' | 'solana' | 'evm' | 'bnb'
  agentId: string
  walletAddress?: string
  agentName?: string
  agentPath?: string
  network?: 'mainnet' | 'testnet'
}

function dismissalKey(walletAddress: string | undefined, agentId: string): string {
  return `tg_cta_dismissed:${walletAddress ?? 'anon'}:${agentId}`
}

export function AttackPageTelegramCTA({
  chain,
  agentId,
  walletAddress,
  agentName,
  agentPath,
  network,
}: Props) {
  const [hidden, setHidden] = useState(true) // start hidden until we read localStorage on the client

  useEffect(() => {
    if (!agentId) return
    try {
      const dismissed = window.localStorage.getItem(dismissalKey(walletAddress, agentId))
      setHidden(dismissed === '1')
    } catch {
      setHidden(false)
    }
  }, [agentId, walletAddress])

  if (hidden || !agentId) return null

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(dismissalKey(walletAddress, agentId), '1')
    } catch {
      // ignore
    }
    setHidden(true)
  }

  return (
    <div className="relative flex flex-col items-start gap-3 border-t border-[#E5E5E5] bg-[#F7FBFE] p-4 text-left sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Don't ask me about this again"
        title="Don't ask me again"
        className="absolute right-3 top-3 rounded-full p-1 text-[#7A7A7A] transition-colors hover:bg-black/5 hover:text-black"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-[#229ED9]">
        <Bell className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-sm font-semibold text-black">
          Watch this sentinel on Telegram
        </p>
        <p className="text-xs text-[#5A5A5A]">
          Get DM&apos;d when other players attack it or when it&apos;s defeated.
        </p>
      </div>
      <ConnectTelegramButton
        chain={chain}
        agentId={agentId}
        role="attacker"
        walletAddress={walletAddress}
        agentName={agentName}
        agentPath={agentPath}
        network={network}
        onConnected={handleDismiss}
      />
    </div>
  )
}
