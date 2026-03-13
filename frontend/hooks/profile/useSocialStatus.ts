import { useQuery } from '@tanstack/react-query'

export interface SocialStatusResponse {
  wallet_address: string
  isGoogleConnected: boolean
  isTelegramConnected: boolean
}

const fetchSocialStatus = async (walletAddress: string): Promise<SocialStatusResponse> => {
  const response = await fetch(`/api/aztec-social-status/${encodeURIComponent(walletAddress)}`)

  if (!response.ok) {
    throw new Error('Failed to fetch social status')
  }

  return response.json()
}

export const SOCIAL_STATUS_QUERY_KEY = 'social-status'

export function useSocialStatus(walletAddress: string | undefined) {
  return useQuery({
    queryKey: [SOCIAL_STATUS_QUERY_KEY, walletAddress],
    queryFn: () => fetchSocialStatus(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
