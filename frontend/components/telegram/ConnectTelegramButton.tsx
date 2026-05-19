'use client'

import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTelegramLinkToken } from '@/hooks/telegram/useTelegramLinkToken'
import { APP_NETWORK } from '@/constants'

type Props = {
  chain: 'sui' | 'solana' | 'evm' | 'bnb'
  agentId: string
  role: 'defender' | 'attacker'
  walletAddress?: string
  agentName?: string
  agentPath?: string
  network?: 'mainnet' | 'testnet'
  label?: string
  className?: string
  onConnected?: () => void
}

export function ConnectTelegramButton({
  chain,
  agentId,
  role,
  walletAddress,
  agentName,
  agentPath,
  network = APP_NETWORK,
  label = 'Connect Telegram',
  className,
  onConnected,
}: Props) {
  const { mutateAsync, isPending } = useTelegramLinkToken()

  const handleClick = async () => {
    try {
      const { deep_link } = await mutateAsync({
        chain,
        agent_id: agentId,
        role,
        wallet_address: walletAddress,
        agent_name: agentName,
        agent_path: agentPath,
        network,
      })
      // Open in a new tab so the app remains open. Telegram handles the rest.
      window.open(deep_link, '_blank', 'noopener,noreferrer')
      onConnected?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open Telegram link'
      toast.error(message)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !agentId}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d8ec0] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {label}
    </button>
  )
}
