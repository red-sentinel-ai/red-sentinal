import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { VoiceTokenResponse } from '@/types/voice'

export const SYNDICATE_VOICE_TOKEN_QUERY_KEY = 'syndicateVoiceToken'

export function useSyndicateVoiceToken(
  syndicateAddress?: string,
  senderAddress?: string,
  enabled = true
) {
  return useQuery<VoiceTokenResponse>({
    queryKey: [SYNDICATE_VOICE_TOKEN_QUERY_KEY, syndicateAddress, senderAddress, APP_NETWORK],
    queryFn: async () => {
      const params = new URLSearchParams({ sender_address: senderAddress! })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicate-chat/${APP_NETWORK}/${syndicateAddress}/voice-token?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to get voice token')
      }

      return res.json()
    },
    staleTime: 60_000,
    enabled: enabled && !!syndicateAddress && !!senderAddress,
  })
}
