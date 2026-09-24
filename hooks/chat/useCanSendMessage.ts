import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { CanSendResponse } from '@/types/chat'

export const CAN_SEND_MESSAGE_QUERY_KEY = 'canSendMessage'

export function useCanSendMessage(agentId?: string, senderAddress?: string) {
  return useQuery<CanSendResponse>({
    queryKey: [CAN_SEND_MESSAGE_QUERY_KEY, agentId, senderAddress, APP_NETWORK],
    queryFn: async () => {
      const params = new URLSearchParams({
        sender_address: senderAddress!,
      })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/chat/${APP_NETWORK}/${agentId}/can-send?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to check send permission')
      }

      return res.json()
    },
    staleTime: 30_000,
    enabled: !!agentId && !!senderAddress,
  })
}
