import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import type { Agent } from '@/types/agents'

export const FEATURED_AGENTS_QUERY_KEY = 'featuredAgents'

export const useFeaturedAgents = (showAllChains?: boolean) => {
  const { activeChain } = useActiveChain()
  const chainFilter = showAllChains ? undefined : activeChain

  return useQuery<Agent[], Error>({
    queryKey: [FEATURED_AGENTS_QUERY_KEY, chainFilter ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        is_featured: 'true',
        limit: '50',
        status: 'active',
      })
      if (chainFilter) params.append('chain', chainFilter)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch featured agents')

      const { agents } = await res.json()
      return agents as Agent[]
    },
    staleTime: 5 * 60 * 1000,
  })
}
