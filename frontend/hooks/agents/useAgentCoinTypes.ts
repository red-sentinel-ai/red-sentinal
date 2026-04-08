import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK, SupportedToken, getTokenForCoinType } from '@/constants'

export const useAgentCoinTypes = () => {
  return useQuery<SupportedToken[]>({
    queryKey: ['agentCoinTypes', APP_NETWORK],
    queryFn: async () => {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/available-coin-types`)
      if (!res.ok) throw new Error('Failed to fetch available coin types')
      const data = await res.json()
      return (data.coin_types as string[]).map(ct => getTokenForCoinType(ct))
    },
    staleTime: 5 * 60 * 1000,
  })
}
