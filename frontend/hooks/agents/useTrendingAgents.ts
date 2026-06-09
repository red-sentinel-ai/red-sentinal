import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import { AgentDetails } from './useAllAgents'

export const TRENDING_AGENTS_QUERY_KEY = 'trendingAgents'

export const useTrendingAgents = (skipChainFilter?: boolean) => {
  const { activeChain } = useActiveChain()
  const chainFilter = skipChainFilter ? undefined : activeChain

  return useQuery<AgentDetails[], Error>({
    queryKey: [TRENDING_AGENTS_QUERY_KEY, chainFilter ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        trending: 'true',
        status: 'active',
        min_balance: '1',
        limit: '50',
      })
      if (chainFilter) {
        params.append('chain', chainFilter)
      }

      const res = await fetch(`${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error('Failed to fetch trending agents')
      }

      const { agents } = await res.json()
      return (agents as AgentDetails[])
        .sort((a, b) => (a.trending_rank ?? 999) - (b.trending_rank ?? 999))
        .map(agent => ({
          ...agent,
          agent_path: agent.agent_name
            ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
            : agent.agent_object_id,
        }))
    },
    staleTime: 5 * 60 * 1000,
  })
}
