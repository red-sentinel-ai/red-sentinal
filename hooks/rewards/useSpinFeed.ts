import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

interface SpinFeedItem {
  walletAddress: string
  tier: string
  multiplier: number
  finalAmount: number
  spunAt: string
}

interface SpinFeedResponse {
  spins: SpinFeedItem[]
  total: number
}

export const useSpinFeed = (limit: number = 50) => {
  return useQuery({
    queryKey: ['spin-feed', limit],
    queryFn: async () => {
      const response = await fetch(
        `${SUI_SENTINEL_API_URL}/boosters/${APP_NETWORK}/feed?limit=${limit}`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch spin feed')
      }

      const data: SpinFeedResponse = await response.json()
      return data
    },
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    staleTime: 5000,
  })
}
