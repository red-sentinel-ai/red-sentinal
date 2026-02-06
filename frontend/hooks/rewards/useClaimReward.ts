import { useMutation } from '@tanstack/react-query'
import { INDEXER_BASE_URL } from '@/constants'

interface ClaimTokensResponse {
  claimed: boolean
  rewardAmount: number
  transferDigest: string | null
  transferError: string | null
  transferSuccess: boolean
}

export const useClaimReward = () => {
  return useMutation({
    mutationFn: async ({
      recipient,
      network = 'testnet',
    }: {
      recipient: string
      network?: string
    }): Promise<ClaimTokensResponse> => {
      if (!recipient) throw new Error('Recipient address is required')

      const url = `${INDEXER_BASE_URL}/claim-tokens/${network}/${recipient}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to claim tokens')
      }

      return response.json()
    },
  })
}
