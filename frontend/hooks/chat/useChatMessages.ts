import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { ChatMessagesResponse } from '@/types/chat'

export const CHAT_MESSAGES_QUERY_KEY = 'chatMessages'

interface UseChatMessagesOptions {
  limit?: number
  offset?: number
}

export function useChatMessages(
  agentId?: string,
  options: UseChatMessagesOptions = {}
) {
  const { limit = 50, offset = 0 } = options

  return useQuery<ChatMessagesResponse>({
    queryKey: [CHAT_MESSAGES_QUERY_KEY, agentId, APP_NETWORK, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/chat/${APP_NETWORK}/${agentId}/messages?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch chat messages')
      }

      return res.json()
    },
    staleTime: 5_000,
    refetchInterval: 30_000, // Fallback polling (real-time handles most updates)
    enabled: !!agentId,
  })
}
