import { useQuery } from '@tanstack/react-query'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'
import type { PracticeAttacksFeedResponse, SentinelInteractionMode } from '@/types/practice'

export const PRACTICE_ATTACKS_FEED_QUERY_KEY = 'practiceAttacksFeed'

const FEED_PAGE_SIZE = 100

interface UsePracticeAttacksFeedOptions {
  network?: string
  excludeOnchain?: boolean
  mode?: SentinelInteractionMode
}

export function usePracticeAttacksFeed(
  id?: number | string,
  {
    network = PRACTICE_NETWORK,
    excludeOnchain = false,
    mode,
  }: UsePracticeAttacksFeedOptions = {}
) {
  return useQuery<PracticeAttacksFeedResponse>({
    queryKey: [PRACTICE_ATTACKS_FEED_QUERY_KEY, network, id, excludeOnchain, mode],
    enabled: id !== undefined && id !== '',
    staleTime: 5_000,
    refetchInterval: 10_000,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(FEED_PAGE_SIZE) })
      if (excludeOnchain) params.set('exclude_onchain', 'true')
      if (mode) params.set('mode', mode)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/practice/${network}/${id}/attacks?${params}`
      )
      if (!res.ok) {
        throw new Error('Failed to load attack feed')
      }
      return res.json()
    },
  })
}
