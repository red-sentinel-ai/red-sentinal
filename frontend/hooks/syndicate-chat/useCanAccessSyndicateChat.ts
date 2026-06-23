import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { SyndicateChatAccessResponse } from '@/types/syndicate-chat'

export const SYNDICATE_CHAT_ACCESS_QUERY_KEY = 'syndicateChatAccess'

export function useCanAccessSyndicateChat(
  syndicateAddress?: string,
  senderAddress?: string
) {
  return useQuery<SyndicateChatAccessResponse>({
    queryKey: [SYNDICATE_CHAT_ACCESS_QUERY_KEY, syndicateAddress, senderAddress, APP_NETWORK],
    queryFn: async () => {
      const params = new URLSearchParams({ sender_address: senderAddress! })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicate-chat/${APP_NETWORK}/${syndicateAddress}/can-access?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to check chat access')
      }

      return res.json()
    },
    staleTime: 30_000,
    enabled: !!syndicateAddress && !!senderAddress,
  })
}
