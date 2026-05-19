import { useMutation, useQueryClient } from '@tanstack/react-query'
import { APP_NETWORK } from '@/constants'

export function useDeleteTelegramSubscription(
  network: 'mainnet' | 'testnet' = APP_NETWORK
) {
  const queryClient = useQueryClient()
  return useMutation<
    { deleted: boolean },
    Error,
    { id: string; walletAddress: string }
  >({
    mutationFn: async ({ id, walletAddress }) => {
      const url = new URL(
        `/api/telegram/subscriptions/${encodeURIComponent(id)}`,
        window.location.origin
      )
      url.searchParams.set('wallet_address', walletAddress)
      url.searchParams.set('network', network)
      const res = await fetch(url.toString(), { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to delete subscription')
      }
      return res.json()
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['telegram-subscriptions', network, vars.walletAddress],
      })
    },
  })
}
