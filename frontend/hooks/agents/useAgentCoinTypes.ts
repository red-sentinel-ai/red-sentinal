import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { SupportedToken } from '@/constants/shared'
import { getTokenForCoinType } from '@/constants/tokens'

export const useAgentCoinTypes = () => {
  return useQuery<SupportedToken[]>({
    queryKey: ['agentCoinTypes', APP_NETWORK],
    queryFn: async () => {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/available-coin-types`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch available coin types')
      const data = await res.json()
      const seen = new Set<string>()
      const tokens: SupportedToken[] = []
      for (const ct of data.coin_types as string[]) {
        const token = getTokenForCoinType(ct)
        if (!seen.has(token.symbol)) {
          seen.add(token.symbol)
          tokens.push(token)
        }
      }
      return tokens
    },
    staleTime: 5 * 60 * 1000,
  })
}
