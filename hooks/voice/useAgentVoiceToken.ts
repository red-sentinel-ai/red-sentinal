import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { VoiceTokenResponse } from '@/types/voice'

export const AGENT_VOICE_TOKEN_QUERY_KEY = 'agentVoiceToken'

export function useAgentVoiceToken(
  agentId?: string,
  senderAddress?: string,
  enabled = true
) {
  return useQuery<VoiceTokenResponse>({
    queryKey: [AGENT_VOICE_TOKEN_QUERY_KEY, agentId, senderAddress, APP_NETWORK],
    queryFn: async () => {
      const params = new URLSearchParams({ sender_address: senderAddress! })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/chat/${APP_NETWORK}/${agentId}/voice-token?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to get voice token')
      }

      return res.json()
    },
    staleTime: 60_000,
    enabled: enabled && !!agentId && !!senderAddress,
  })
}
