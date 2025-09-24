import { useQuery } from '@tanstack/react-query'
import { RewardsMission } from '@/types/Rewards'

interface MissionsResponse {
  enabled: boolean
  missions: RewardsMission[]
  points_name: string
  points_symbol: string
  message?: string
}

export function useRewardsMissions() {
  return useQuery({
    queryKey: ['rewards-missions'],
    queryFn: async (): Promise<MissionsResponse> => {
      const response = await fetch('/api/rewards/missions')
      if (!response.ok) {
        throw new Error('Failed to fetch missions')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}
