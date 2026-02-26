import { useInfiniteQuery } from '@tanstack/react-query'
import { LeaderboardEntry } from '@/types/Rewards'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  total: number
  limit: number
  offset: number
}

export function useRewardsLeaderboard(limit = 20, search = '') {
  return useInfiniteQuery({
    queryKey: ['rewards-leaderboard', limit, search],
    queryFn: async ({ pageParam = 0 }): Promise<LeaderboardResponse> => {
      const url = new URL(`${SUI_SENTINEL_API_URL}/rewards/leaderboard/${APP_NETWORK}`)
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('offset', String(pageParam))
      if (search) url.searchParams.set('search', search)

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.leaderboard.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
