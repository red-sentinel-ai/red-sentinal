import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { ChatMessage, SendMessageResponse } from '@/types/chat'
import { CHAT_MESSAGES_QUERY_KEY } from './useChatMessages'

interface SendMessageParams {
  agentId: string
  content: string
  senderAddress: string
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()

  return useMutation<SendMessageResponse, Error, SendMessageParams>({
    mutationFn: async ({ agentId, content, senderAddress }) => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/chat/${APP_NETWORK}/${agentId}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            sender_address: senderAddress,
          }),
        }
      )

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to send message' }))
        throw new Error(error.message || 'Failed to send message')
      }

      return res.json()
    },
    onSuccess: (data, variables) => {
      // Invalidate chat messages to refetch
      queryClient.invalidateQueries({
        queryKey: [CHAT_MESSAGES_QUERY_KEY, variables.agentId, APP_NETWORK],
      })
    },
  })
}
