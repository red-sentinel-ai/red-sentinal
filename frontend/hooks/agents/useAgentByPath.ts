import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { AgentDetails, fetchAgentDetailsViaObject } from './useAllAgents'

export const AGENT_DETAILS_QUERY_KEY = 'agentByPath'

export const useAgentByPath = (agentPath?: string) => {
  const client = useSuiClient()

  return useQuery<AgentDetails, Error>({
    queryKey: [AGENT_DETAILS_QUERY_KEY, agentPath],
    enabled: !!agentPath,
    queryFn: async () => {
      const res = await fetch(`/api/agents/single?agent_path=${agentPath}`)
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
