import { useQuery } from '@tanstack/react-query'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'
import type { PracticeAttacksFeedResponse } from '@/types/practice'

export const PRACTICE_ATTACKS_FEED_QUERY_KEY = 'practiceAttacksFeed'

interface UsePracticeAttacksFeedOptions {
  network?: string
  excludeOnchain?: boolean
}

export function usePracticeAttacksFeed(
  id?: number | string,
  { network = PRACTICE_NETWORK, excludeOnchain = false }: UsePracticeAttacksFeedOptions = {}
) {
  return useQuery<PracticeAttacksFeedResponse>({
    queryKey: [PRACTICE_ATTACKS_FEED_QUERY_KEY, network, id, excludeOnchain],
    enabled: id !== undefined && id !== '',
    staleTime: 5_000,
    refetchInterval: 10_000,
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/practice/${network}/${id}/attacks?limit=100${
          excludeOnchain ? '&exclude_onchain=true' : ''
        }`
      )
      if (!res.ok) {
        throw new Error('Failed to load attack feed')
      }
      return res.json()
    },
  })
}
