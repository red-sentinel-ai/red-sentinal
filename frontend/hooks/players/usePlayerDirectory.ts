import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

export interface PlayerEntry {
  rank: number
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  wallet_address: string | null
  totalAttacks: number
  totalBountyUsd: number
  sentinelsLaunched: number
  followers: number
  following: number
  is_following: boolean
}

export interface PlayerDirectoryResponse {
  players: PlayerEntry[]
  total: number
  limit: number
  offset: number
}

export const PLAYER_DIRECTORY_QUERY_KEY = 'player-directory'

export function usePlayerDirectory(viewerId?: string, search = '', limit = 25) {
  return useInfiniteQuery({
    queryKey: [PLAYER_DIRECTORY_QUERY_KEY, search, limit, viewerId],
    queryFn: async ({ pageParam = 0 }): Promise<PlayerDirectoryResponse> => {
      const url = new URL(`${SUI_SENTINEL_API_URL}/players/${APP_NETWORK}`)
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('offset', String(pageParam))
      if (search) url.searchParams.set('search', search)
      if (viewerId) url.searchParams.set('viewerId', viewerId)

      const response = await fetch(url.toString(), { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch player directory')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.players.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
