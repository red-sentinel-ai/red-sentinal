import { useQuery } from '@tanstack/react-query'
import { getFollowCounts } from '@/lib/auth-api'
import { useAuth } from '@/context/AuthContext'

export const FOLLOW_COUNTS_QUERY_KEY = 'follow-counts'

interface UseFollowCountsOptions {
  enabled?: boolean
}

/**
 * Follower / following counts for a user, plus whether the connected viewer
 * follows them. `identifier` is a user id (uuid) or username.
 */
export function useFollowCounts(
  identifier: string | undefined,
  { enabled = true }: UseFollowCountsOptions = {}
) {
  const { user } = useAuth()
  const viewerId = user?.id

  return useQuery({
    queryKey: [FOLLOW_COUNTS_QUERY_KEY, identifier, viewerId],
    queryFn: () => getFollowCounts(identifier as string, viewerId),
    enabled: enabled && Boolean(identifier),
    staleTime: 60 * 1000,
  })
}
