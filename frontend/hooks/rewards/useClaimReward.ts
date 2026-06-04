import { useMutation } from '@tanstack/react-query'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'

interface BoosterAwarded {
  tier: string
  multiplier: number
  expiresAt: string
  boosterId: string
}

interface ClaimTokensResponse {
  claimed: boolean
  boosterAwarded?: BoosterAwarded
  sentinelOwnerReward?: number
  message?: string
  // Legacy fields (kept for backward compatibility)
  rewardAmount?: number
  transferDigest?: string | null
  transferError?: string | null
  transferSuccess?: boolean
}

export const useClaimReward = () => {
  return useMutation({
    mutationFn: async ({
      recipient,
      network = APP_NETWORK,
    }: {
      recipient: string
      network?: string
    }): Promise<ClaimTokensResponse> => {
      if (!recipient) throw new Error('Recipient address is required')

      const url = `${SUI_SENTINEL_API_URL}/claim-tokens/${network}/${recipient}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
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
