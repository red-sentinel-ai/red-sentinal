import { useQuery } from '@tanstack/react-query'
import { AgentDetails } from './useAllAgents'
import { useSuiClient } from '@mysten/dapp-kit'
import { fetchAgentDetailsViaObject } from '@/lib/sui-utils'

export const useAgentsByOwner = (owner: string | undefined) => {
  const client = useSuiClient()

  return useQuery<AgentDetails[]>({
    queryKey: ['agents-by-owner', owner],
    queryFn: async () => {
      const res = await fetch(`/api/agents/owner?owner=${owner}`)
      if (!res.ok) throw new Error('Failed to fetch agents')

      const basicAgents: Omit<AgentDetails, 'cost_per_message' | 'system_prompt' | 'balance'>[] =
        await res.json()

      const enrichedAgents = await Promise.all(
        basicAgents.map(async (agent) => {
          const onchain = await fetchAgentDetailsViaObject(client, agent.object_id)
          return {
            ...agent,
            ...onchain,
          }
        })
      )

      return enrichedAgents
    },

    enabled: !!owner,
  })
}
