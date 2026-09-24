import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { SupportedChain } from '@/constants/chains'
import type { Agent } from '@/types/agents'

export const useAgentsByOwner = (
  ownerAddress: string | undefined,
  chain?: SupportedChain
) => {
  return useQuery<Agent[]>({
    queryKey: ['agents-by-owner', ownerAddress, chain],
    queryFn: async () => {
      const params = new URLSearchParams({
        creator: ownerAddress as string,
        limit: '50',
        include_prize_pool: 'true',
      })
      if (chain) params.set('chain', chain)

      const res = await fetch(`${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch agents')

      const { agents } = await res.json()
      return agents as Agent[]
    },
    enabled: !!ownerAddress,
  })
}
