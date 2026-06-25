import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import { deriveAgentPath } from '@/lib/utils'
import type { Agent } from '@/types/agents'

export const TRENDING_AGENTS_QUERY_KEY = 'trendingAgents'

export const useTrendingAgents = (showAllChains?: boolean) => {
  const { activeChain } = useActiveChain()
  const chainFilter = showAllChains ? undefined : activeChain

  return useQuery<Agent[], Error>({
    queryKey: [TRENDING_AGENTS_QUERY_KEY, chainFilter ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        trending: 'true',
        status: 'active',
        min_balance: '1',
        limit: '50',
      })
      if (chainFilter) params.append('chain', chainFilter)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch trending agents')

      const { agents } = await res.json()
      return (agents as Agent[])
        .sort((a, b) => (a.trending_rank ?? 999) - (b.trending_rank ?? 999))
        .map(agent => ({
          ...agent,
          agent_path: deriveAgentPath(agent),
        }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
