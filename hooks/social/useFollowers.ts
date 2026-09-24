import { useInfiniteQuery } from '@tanstack/react-query'
import { getFollowers, getFollowing, type FollowListResponse } from '@/lib/auth-api'
import { useAuth } from '@/context/AuthContext'

export const FOLLOWERS_QUERY_KEY = 'followers'
export const FOLLOWING_QUERY_KEY = 'following'

function getNextPageParam(lastPage: FollowListResponse) {
  const nextOffset = lastPage.offset + lastPage.limit
  if (lastPage.users.length < lastPage.limit || nextOffset >= lastPage.total) {
    return undefined
  }
  return nextOffset
}

/**
 * Paginated list of the users who follow `identifier` (uuid or username).
 */
export function useFollowers(identifier: string | undefined, limit = 20) {
  const { user } = useAuth()
  const viewerId = user?.id

  return useInfiniteQuery({
    queryKey: [FOLLOWERS_QUERY_KEY, identifier, viewerId],
    queryFn: ({ pageParam = 0 }) =>
      getFollowers(identifier as string, { limit, offset: pageParam, viewerId }),
    getNextPageParam,
    initialPageParam: 0,
    enabled: Boolean(identifier),
    staleTime: 60 * 1000,
  })
}

/**
 * Paginated list of the users `identifier` (uuid or username) is following.
 */
export function useFollowing(identifier: string | undefined, limit = 20) {
  const { user } = useAuth()
  const viewerId = user?.id

  return useInfiniteQuery({
    queryKey: [FOLLOWING_QUERY_KEY, identifier, viewerId],
    queryFn: ({ pageParam = 0 }) =>
      getFollowing(identifier as string, { limit, offset: pageParam, viewerId }),
    getNextPageParam,
    initialPageParam: 0,
    enabled: Boolean(identifier),
    staleTime: 60 * 1000,
  })
}
