import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import type {
  BoostersResponse,
  SpinRequest,
  SpinResponse,
  SpinHistoryItem,
} from '@/types'

export const useUserBoosters = (walletAddress: string | undefined) => {
  return useQuery<BoostersResponse>({
    queryKey: ['boosters', walletAddress],
    queryFn: async (): Promise<BoostersResponse> => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const url = `${SUI_SENTINEL_API_URL}/boosters/${APP_NETWORK}/boosters/${walletAddress}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch boosters')
      }

      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000,
  })
}

export const useSpinBooster = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (spinRequest: SpinRequest): Promise<SpinResponse> => {
      const url = `${SUI_SENTINEL_API_URL}/boosters/${APP_NETWORK}/spin`

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spinRequest),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to spin booster')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boosters', variables.walletAddress] })
      queryClient.invalidateQueries({ queryKey: ['spin-history', variables.walletAddress] })
    },
  })
}

export const useSpinHistory = (
  walletAddress: string | undefined,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery<{ spins: SpinHistoryItem[]; total: number }>({
    queryKey: ['spin-history', walletAddress, limit, offset],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const url = `${SUI_SENTINEL_API_URL}/boosters/${APP_NETWORK}/spins/${walletAddress}?limit=${limit}&offset=${offset}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch spin history')
      }

      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000,
  })
}
