import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { fetchAgentDetailsViaObject } from './useAllAgents'

export interface AgentDetails {
  agent_id: string
  agent_name: string
  agent_profile: string
  object_id: string
  owner: string
  is_featured: boolean
  cost_per_message: number
  system_prompt: string
  balance: number
}

export const useAgentByObjectId = (objectId?: string) => {
  const client = useSuiClient()

  return useQuery<AgentDetails, Error>({
    queryKey: ['agentByObjectId', objectId],
    enabled: !!objectId,
    queryFn: async () => {
      const res = await fetch(`/api/agents/single?object_id=${objectId}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch agent')
      }

      const baseAgent: Omit<AgentDetails, 'cost_per_message' | 'system_prompt' | 'balance'> =
        await res.json()

      const onchain = await fetchAgentDetailsViaObject(client, baseAgent.object_id)

      return {
        ...baseAgent,
        ...onchain,
      }
    },
  })
}
