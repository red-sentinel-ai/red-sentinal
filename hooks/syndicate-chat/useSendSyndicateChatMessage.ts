import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { SYNDICATE_CHAT_MESSAGES_QUERY_KEY } from './useSyndicateChatMessages'

interface SendSyndicateMessageParams {
  syndicateAddress: string
  content: string
  senderAddress: string
}

export function useSendSyndicateChatMessage() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, SendSyndicateMessageParams>({
    mutationFn: async ({ syndicateAddress, content, senderAddress }) => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicate-chat/${APP_NETWORK}/${syndicateAddress}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, sender_address: senderAddress }),
        }
      )

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to send message' }))
        throw new Error(error.message || 'Failed to send message')
      }

      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SYNDICATE_CHAT_MESSAGES_QUERY_KEY, variables.syndicateAddress],
      })
    },
  })
}
