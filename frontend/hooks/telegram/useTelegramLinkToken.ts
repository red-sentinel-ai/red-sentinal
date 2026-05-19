import { useMutation } from '@tanstack/react-query'
import { APP_NETWORK } from '@/constants'

export type LinkTokenInput = {
  chain: 'sui' | 'solana' | 'evm' | 'bnb'
  agent_id: string
  role: 'defender' | 'attacker'
  wallet_address?: string
  agent_name?: string
  agent_path?: string
  network?: 'mainnet' | 'testnet'
}

export type LinkTokenResponse = {
  token: string
  deep_link: string
  expires_at: string
  bot_username: string | null
}

export function useTelegramLinkToken() {
  return useMutation<LinkTokenResponse, Error, LinkTokenInput>({
    mutationFn: async input => {
      const body = { network: APP_NETWORK, ...input }
      const res = await fetch('/api/telegram/link-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || data?.message || 'Failed to create Telegram link')
      }
      return res.json()
    },
  })
}
