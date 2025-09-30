import { useQuery } from '@tanstack/react-query'
import { UserRewardsData } from '@/types/Rewards'

export function useUserRewards(walletAddress: string | null) {
  return useQuery<UserRewardsData>({
    queryKey: ['user-rewards', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address required')
      }
      const response = await fetch(`/api/rewards/user/${walletAddress}`)

      if (response.status === 404) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'User profile not found.')
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user rewards')
      }
      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('User profile not found')) {
        return false
      }
      return failureCount < 2
    },
  })
}
