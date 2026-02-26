import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { AgentDetails } from './useAllAgents'
import { fetchAgentOnChainDetails } from '@/lib/sui-utils'

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

      const base = await res.json()
      const onchain = await fetchAgentOnChainDetails(client, base.object_id)

      return {
        agent_id: String(base.agent_id),
        agent_name: base.agent_name,
        prompt: onchain.prompt,
        agent_image: base.agent_profile || null,
        creator: base.owner,
        cost_per_message: String(onchain.cost_per_message),
        total_balance: String(onchain.balance),
        agent_object_id: base.object_id,
        is_featured: base.is_featured,
        model_name: base.model_name || null,
        model_provider: base.model_provider || null,
        state: onchain.is_defeated ? 'defeated' : 'active',
        total_attacks: 0,
        agent_path: base.agent_path || '',
        timestampMs: base.created_at
          ? String(new Date(base.created_at).getTime())
          : undefined,
        last_funded_timestamp: onchain.last_funded_timestamp,
        accumulated_fees: onchain.accumulated_fees,
      } as AgentDetails
    },
  })
}
