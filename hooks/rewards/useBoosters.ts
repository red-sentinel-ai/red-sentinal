import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL } from '@/constants'
import type {
  PassesResponse,
  SpinRequest,
  SpinResponse,
  LoyaltyBalanceResponse,
} from '@/types'

export const useUserPasses = (walletAddress: string | undefined) => {
  return useQuery<PassesResponse>({
    queryKey: ['passes', walletAddress],
    queryFn: async (): Promise<PassesResponse> => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const url = `${SUI_SENTINEL_API_URL}/loyalty/passes/${walletAddress}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch spin passes')
      }

      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000,
  })
}

export const useLoyaltyBalance = (walletAddress: string | undefined) => {
  return useQuery<LoyaltyBalanceResponse>({
    queryKey: ['loyalty-balance', walletAddress],
    queryFn: async (): Promise<LoyaltyBalanceResponse> => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const url = `${SUI_SENTINEL_API_URL}/loyalty/balance/${walletAddress}`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch points balance')
      }

      return response.json()
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000,
  })
}

export const useSpinPass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (spinRequest: SpinRequest): Promise<SpinResponse> => {
      const url = `${SUI_SENTINEL_API_URL}/loyalty/spin`

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
        throw new Error(errorData.message || 'Failed to spin pass')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passes', variables.walletAddress] })
      queryClient.invalidateQueries({ queryKey: ['spin-history', variables.walletAddress] })
      queryClient.invalidateQueries({ queryKey: ['loyalty-balance', variables.walletAddress] })
    },
  })
}

export const useSpinHistory = (
  walletAddress: string | undefined,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery<{ spins: import('@/types').SpinHistoryItem[]; total: number }>({
    queryKey: ['spin-history', walletAddress, limit, offset],
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const url = `${SUI_SENTINEL_API_URL}/loyalty/spins/${walletAddress}?limit=${limit}&offset=${offset}`

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
