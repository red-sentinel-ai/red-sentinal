import { useInfiniteQuery } from '@tanstack/react-query'
import { LeaderboardEntry } from '@/types/ravenRewards'

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  limit: number
  offset: number
}

export function useRewardsLeaderboard(limit = 20, search = '') {
  return useInfiniteQuery({
    queryKey: ['rewards-leaderboard', limit, search],
    queryFn: async ({ pageParam = 0 }): Promise<LeaderboardResponse> => {
      const url =
        `/api/rewards/leaderboard?limit=${limit}&offset=${pageParam}` +
        (search ? `&search=${encodeURIComponent(search)}` : '')
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      const data = await response.json()
      return { ...data, pageParam }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.leaderboard.length < lastPage.limit) {
        return undefined
      }
      return lastPage.offset + lastPage.limit
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
