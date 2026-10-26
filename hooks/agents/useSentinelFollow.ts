import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { followSentinel, getSentinelFollowState, unfollowSentinel } from '@/lib/auth-api'
import { useAuth } from '@/context/AuthContext'

export const SENTINEL_FOLLOW_QUERY_KEY = 'sentinel-follow'

type SentinelRef = { agentId: string; chain: string; network: string }

/**
 * Follow state + follow/unfollow for a single sentinel. Following subscribes the
 * logged-in profile to the sentinel's Novu topic so they get its notifications.
 */
export function useSentinelFollow({ agentId, chain, network }: SentinelRef) {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  const queryKey = [SENTINEL_FOLLOW_QUERY_KEY, agentId, chain, network, userId]

  const { data: isFollowing = false, isLoading } = useQuery({
    queryKey,
    queryFn: () => getSentinelFollowState(agentId, chain, network),
    enabled: Boolean(userId && agentId && chain && network),
    staleTime: 60_000,
  })

  const follow = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Connect your wallet to follow sentinels')
      return followSentinel(agentId, chain, network)
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, true)
      toast.success('Following — you’ll get this sentinel’s notifications')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const unfollow = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Connect your wallet to manage follows')
      return unfollowSentinel(agentId, chain, network)
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, false)
      toast.success('Unfollowed')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return {
    canFollow: Boolean(userId),
    isFollowing,
    isLoading,
    isPending: follow.isPending || unfollow.isPending,
    toggle: () => (isFollowing ? unfollow.mutate() : follow.mutate()),
  }
}
