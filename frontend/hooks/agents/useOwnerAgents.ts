import { useQuery } from '@tanstack/react-query'
import { AgentDetails } from './useAllAgents'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'

export const useAgentsByOwner = (owner: string | undefined) => {
  const { activeChain } = useActiveChain()

  return useQuery<AgentDetails[]>({
    queryKey: ['agents-by-owner', owner, activeChain],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?creator=${owner}&limit=50&include_prize_pool=true&chain=${activeChain}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch agents')

      const { agents } = await res.json()
      return agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: agent.agent_name
          ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
          : agent.agent_object_id,
      }))
    },
    enabled: !!owner,
  })
}
