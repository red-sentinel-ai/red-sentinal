import { useQuery } from '@tanstack/react-query'
import { UserRewardsData } from '@/types/ravenRewards'
import { useSocialStatus } from '../profile/useSocialStatus'

export function useUserRewards(walletAddress: string | null) {
  const { data: socialStatus, isLoading: socialLoading } = useSocialStatus(
    walletAddress || undefined
  )

  const hasTwitter = socialStatus?.isXConnected || false
  const hasDiscord = socialStatus?.isDiscordConnected || false
  const hasAnyConnection = hasTwitter || hasDiscord

  return useQuery<UserRewardsData>({
    queryKey: ['user-rewards', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address required')
      }
      const response = await fetch(`/api/rewards/user/${walletAddress}`)

      if (response.status === 403) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Access denied to rewards program')
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user rewards')
      }
      return response.json()
    },
    enabled: !!walletAddress && hasAnyConnection && !socialLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('Access denied')) {
        return false
      }
      return failureCount < 2
    },
  })
}
