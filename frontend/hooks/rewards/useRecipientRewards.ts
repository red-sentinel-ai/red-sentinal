import { useQuery } from '@tanstack/react-query'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import { RewardsHistoryResponse } from '@/types/Rewards'

export const useRecipientRewards = (
  recipient: string | undefined,
  network: string = APP_NETWORK
) => {
  return useQuery({
    queryKey: ['recipient-rewards', network, recipient],
    queryFn: async (): Promise<RewardsHistoryResponse> => {
      if (!recipient) throw new Error('Recipient address is required')

      const url = `${SUI_SENTINEL_API_URL}/rewards/${network}/${recipient}?page=1&limit=50`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch rewards history')
      }

      return response.json()
    },
    enabled: !!recipient,
    staleTime: 60 * 1000, // 1 minute cache
    refetchOnWindowFocus: false,
  })
}
