import { useQuery } from '@tanstack/react-query'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'
import type { PracticeAttacksFeedResponse } from '@/types/practice'

export const PRACTICE_ATTACKS_FEED_QUERY_KEY = 'practiceAttacksFeed'

/** Public feed of all attempts against a practice sentinel (polls every 10s). */
export function usePracticeAttacksFeed(id?: number | string) {
  return useQuery<PracticeAttacksFeedResponse>({
    queryKey: [PRACTICE_ATTACKS_FEED_QUERY_KEY, id],
    enabled: id !== undefined && id !== '',
    staleTime: 5_000,
    refetchInterval: 10_000,
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/practice/${PRACTICE_NETWORK}/${id}/attacks?limit=100`
      )
      if (!res.ok) {
        throw new Error('Failed to load attack feed')
      }
      return res.json()
    },
  })
}
