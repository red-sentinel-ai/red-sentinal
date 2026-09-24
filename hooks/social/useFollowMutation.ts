import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { followUser, unfollowUser } from '@/lib/auth-api'
import { useAuth } from '@/context/AuthContext'
import { FOLLOW_COUNTS_QUERY_KEY } from './useFollowCounts'
import { FOLLOWERS_QUERY_KEY, FOLLOWING_QUERY_KEY } from './useFollowers'

function useInvalidateFollowQueries() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: [FOLLOW_COUNTS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [FOLLOWERS_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: [FOLLOWING_QUERY_KEY] })
  }
}

/**
 * Follow a user. `mutate(targetUserId)` where targetUserId is a user id (uuid).
 */
export function useFollowMutation() {
  const { user } = useAuth()
  const invalidate = useInvalidateFollowQueries()

  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!user) throw new Error('Connect your wallet to follow users')
      return followUser(user.id, targetUserId)
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  })
}

/**
 * Unfollow a user. `mutate(targetUserId)` where targetUserId is a user id (uuid).
 */
export function useUnfollowMutation() {
  const { user } = useAuth()
  const invalidate = useInvalidateFollowQueries()

  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!user) throw new Error('Connect your wallet to manage follows')
      return unfollowUser(user.id, targetUserId)
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  })
}
