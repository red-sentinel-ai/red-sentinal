import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { MentionSuggestionsResponse, MentionUser } from '@/types/chat'

export const MENTION_SUGGESTIONS_QUERY_KEY = 'mentionSuggestions'

const MAX_SUGGESTIONS = 8

export function useMentionSuggestions(query: string | null) {
  return useQuery<MentionUser[]>({
    queryKey: [MENTION_SUGGESTIONS_QUERY_KEY, APP_NETWORK, query],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query ?? '',
        limit: MAX_SUGGESTIONS.toString(),
      })

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/chat/${APP_NETWORK}/mentions?${params}`,
        { credentials: 'include' }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch mention suggestions')
      }

      const data: MentionSuggestionsResponse = await res.json()
      return data.users
    },
    enabled: query !== null,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
