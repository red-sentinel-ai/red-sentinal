import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/context/AuthContext'
import { fetchSentinelMemories } from '@/lib/sentinel-memory-api'

export const SENTINEL_MEMORIES_QUERY_KEY = 'sentinel-memories'

/**
 * A sentinel's Walrus memories, for the authenticated owner only.
 *
 * The query runs only when a user is signed in; the backend returns 401/403 for
 * non-owners, which `fetchSentinelMemories` maps to `null` so callers can hide
 * the panel. Recalled memories are working attack prompts, so they must never
 * be shown to anyone but the sentinel's creator.
 */
export function useSentinelMemories(network: string, sentinelId: number) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: [SENTINEL_MEMORIES_QUERY_KEY, network, sentinelId, userId],
    queryFn: () =>
      fetchSentinelMemories({ network, sentinelId, userId: userId as string }),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  })
}
