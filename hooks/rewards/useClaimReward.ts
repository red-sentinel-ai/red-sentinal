import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL } from '@/constants'
import type { ClaimLoyaltyResponse } from '@/types'

/**
 * Claims pending attack rewards for a wallet (any chain): awards a Spin Pass
 * plus direct Sentinel Points. 404 simply means nothing is pending.
 */
export const useClaimReward = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipient,
    }: {
      recipient: string
    }): Promise<ClaimLoyaltyResponse> => {
      if (!recipient) throw new Error('Recipient address is required')

      const url = `${SUI_SENTINEL_API_URL}/loyalty/claim/${recipient}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to claim rewards')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      if (data.claimed) {
        queryClient.invalidateQueries({ queryKey: ['passes', variables.recipient] })
        queryClient.invalidateQueries({ queryKey: ['loyalty-balance', variables.recipient] })
      }
    },
  })
}
