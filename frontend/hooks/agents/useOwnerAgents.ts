import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { deriveAgentPath } from '@/lib/utils'
import { AgentDetails } from './useAllAgents'

export const useAgentsByOwner = (ownerAddress: string | undefined) => {
  return useQuery<AgentDetails[]>({
    queryKey: ['agents-by-owner', ownerAddress],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?creator=${ownerAddress}&limit=50&include_prize_pool=true`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch agents')

      const { agents } = await res.json()
      return agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: deriveAgentPath(agent),
      }))
    },
    enabled: !!ownerAddress,
  })
}
