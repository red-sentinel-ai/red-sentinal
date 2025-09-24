import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { AgentDetails } from './useAllAgents'
import { fetchAgentDetailsViaObject } from '@/lib/sui-utils'

export const AGENT_DETAILS_QUERY_KEY = 'agentBySlug'

export const useAgentBySlug = (slug?: string) => {
  const client = useSuiClient()

  return useQuery<AgentDetails, Error>({
    queryKey: [AGENT_DETAILS_QUERY_KEY, slug],
    enabled: !!slug,
    queryFn: async () => {
      const isObjectId = slug!.startsWith('0x') && slug!.length > 60
      const queryParam = isObjectId ? `object_id=${slug}` : `agent_path=${slug}`

      const res = await fetch(`/api/agents/single?${queryParam}`)
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
