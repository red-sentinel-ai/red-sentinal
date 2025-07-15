import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'

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

export const fetchAgentDetailsViaObject = async (
  client: SuiClient,
  agentObjectId: string
): Promise<Pick<AgentDetails, 'cost_per_message' | 'system_prompt' | 'balance'>> => {
  try {
    const response = await client.getObject({
      id: agentObjectId,
      options: {
        showContent: true,
        showType: true,
      },
    })

    if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
      throw new Error('Invalid agent object')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (response.data.content as any).fields

    return {
      cost_per_message: Number(fields.cost_per_message),
      system_prompt: fields.system_prompt,
      balance: Number(fields.balance),
    }
  } catch (error) {
    console.error('Error fetching agent details via getObject:', error)
    return {
      cost_per_message: 0,
      system_prompt: '',
      balance: 0,
    }
  }
}

export const useAllAgents = () => {
  const client = useSuiClient()

  return useQuery<AgentDetails[], Error>({
    queryKey: ['allAgents'],
    queryFn: async () => {
      console.log('refetching agent')
      const res = await fetch('/api/agents/all')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch agents')
      }

      const basicAgents: Omit<AgentDetails, 'cost_per_message' | 'system_prompt' | 'balance'>[] =
        await res.json()

      // Enrich each agent with Sui on-chain details
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
  })
}
