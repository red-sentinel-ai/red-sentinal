import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { SyndicateChatMessagesResponse } from '@/types/syndicate-chat'

export const SYNDICATE_CHAT_MESSAGES_QUERY_KEY = 'syndicateChatMessages'

interface UseSyndicateChatMessagesOptions {
  limit?: number
  offset?: number
}

/**
 * Read a syndicate's private chat history. Reads are membership-gated on the
 * backend by the connected wallet, so `senderAddress` is required and the chat
 * is polled (rather than subscribed to over Supabase realtime) to keep message
 * content private.
 */
export function useSyndicateChatMessages(
  syndicateAddress?: string,
  senderAddress?: string,
  options: UseSyndicateChatMessagesOptions = {}
) {
  const { limit = 50, offset = 0 } = options

  return useQuery<SyndicateChatMessagesResponse>({
    queryKey: [
      SYNDICATE_CHAT_MESSAGES_QUERY_KEY,
      syndicateAddress,
      senderAddress,
      APP_NETWORK,
      limit,
      offset,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        sender_address: senderAddress!,
        limit: limit.toString(),
        offset: offset.toString(),
      })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicate-chat/${APP_NETWORK}/${syndicateAddress}/messages?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch syndicate chat messages')
      }

      return res.json()
    },
    staleTime: 3_000,
    refetchInterval: 5_000,
    enabled: !!syndicateAddress && !!senderAddress,
  })
}
