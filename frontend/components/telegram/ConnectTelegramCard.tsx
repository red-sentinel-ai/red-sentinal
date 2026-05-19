'use client'

import { Bell } from 'lucide-react'
import { ConnectTelegramButton } from './ConnectTelegramButton'

type Props = {
  chain: 'sui' | 'solana' | 'evm' | 'bnb'
  agentId: string
  role: 'defender' | 'attacker'
  walletAddress?: string
  agentName?: string
  agentPath?: string
  network?: 'mainnet' | 'testnet'
  title?: string
  subtitle?: string
}

export function ConnectTelegramCard({
  chain,
  agentId,
  role,
  walletAddress,
  agentName,
  agentPath,
  network,
  title,
  subtitle,
}: Props) {
  const defaultTitle =
    role === 'defender'
      ? 'Get notified when someone attacks your sentinel'
      : 'Watch this sentinel'
  const defaultSubtitle =
    role === 'defender'
      ? "I'll DM you on Telegram when there's an attack attempt, a close call, or a breach."
      : "Get DM'd when someone else attacks it or when it falls."

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4 text-left sm:flex-row sm:items-center sm:gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#229ED9]/10 text-[#229ED9]">
        <Bell className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {title ?? defaultTitle}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {subtitle ?? defaultSubtitle}
        </p>
      </div>
      <ConnectTelegramButton
        chain={chain}
        agentId={agentId}
        role={role}
        walletAddress={walletAddress}
        agentName={agentName}
        agentPath={agentPath}
        network={network}
      />
    </div>
  )
}
