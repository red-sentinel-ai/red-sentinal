import { useQuery } from '@tanstack/react-query'

import { fetchSentinelMemories } from '@/lib/sentinel-memory-api'

export const SENTINEL_MEMORIES_QUERY_KEY = 'sentinel-memories'

export function useSentinelMemories(network: string, sentinelId: number) {
  return useQuery({
    queryKey: [SENTINEL_MEMORIES_QUERY_KEY, network, sentinelId],
    queryFn: () => fetchSentinelMemories({ network, sentinelId }),
    staleTime: 60 * 1000,
    retry: false,
  })
}
