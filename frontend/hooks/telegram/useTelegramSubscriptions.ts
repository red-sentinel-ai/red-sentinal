import { useQuery } from '@tanstack/react-query'
import { APP_NETWORK } from '@/constants'

export type TelegramSubscription = {
  _id: string
  chat_id: number | string
  agent_id: string
  chain: string
  role: 'defender' | 'attacker'
  wallet_address: string | null
  agent_name: string | null
  agent_path: string | null
  telegram_username: string | null
  created_at: string
  last_notified_at: string | null
}

export function useTelegramSubscriptions(
  walletAddress: string | null | undefined,
  network: 'mainnet' | 'testnet' = APP_NETWORK
) {
  return useQuery({
    queryKey: ['telegram-subscriptions', network, walletAddress],
    queryFn: async (): Promise<{ subscriptions: TelegramSubscription[] }> => {
      const url = new URL('/api/telegram/subscriptions', window.location.origin)
      url.searchParams.set('wallet_address', walletAddress!)
      url.searchParams.set('network', network)
      const res = await fetch(url.toString())
      if (!res.ok) {
        throw new Error('Failed to fetch Telegram subscriptions')
      }
      return res.json()
    },
    enabled: Boolean(walletAddress),
    staleTime: 30 * 1000,
  })
}
