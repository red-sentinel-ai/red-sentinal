import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import { AgentDetails } from './useAllAgents'

export const FEATURED_AGENTS_QUERY_KEY = 'featuredAgents'

export const useFeaturedAgents = () => {
  const { activeChain } = useActiveChain()

  return useQuery<AgentDetails[], Error>({
    queryKey: [FEATURED_AGENTS_QUERY_KEY, activeChain],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?is_featured=true&limit=50&include_prize_pool=true&min_balance=1&status=active&chain=${activeChain}`
      )
      if (!res.ok) {
        throw new Error('Failed to fetch featured agents')
      }
      const { agents } = await res.json()
      return agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: agent.agent_name
          ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
          : agent.agent_object_id,
      }))
    },
    staleTime: 60 * 1000,
  })
}
