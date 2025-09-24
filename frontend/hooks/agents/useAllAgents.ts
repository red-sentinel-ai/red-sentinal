import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { SUI_CONFIG } from '@/constants'
import { AgentStatus } from '@/types'

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
  status: AgentStatus
  agent_path: string
}

async function getDefeatedAgentIds(client: SuiClient): Promise<Set<string>> {
  const packageId = SUI_CONFIG.EXAMPLES_PACKAGE_ID
  const moduleName = SUI_CONFIG.MODULE_NAME

  try {
    const defeatedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::AgentDefeated`,
      },
      limit: 100,
      order: 'descending',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defeatedIds = defeatedEvents.data.map((event: any) => event.parsedJson.agent_id)
    return new Set(defeatedIds)
  } catch (error) {
    console.error('Error fetching defeated agent events:', error)
    return new Set()
  }
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
      const [defeatedAgentIds, basicAgentsRes] = await Promise.all([
        getDefeatedAgentIds(client),
        fetch('/api/agents/all'),
      ])

      if (!basicAgentsRes.ok) {
        const err = await basicAgentsRes.json()
        throw new Error(err.error || 'Failed to fetch agents')
      }

      const basicAgents: Omit<
        AgentDetails,
        'cost_per_message' | 'system_prompt' | 'balance' | 'status'
      >[] = await basicAgentsRes.json()

      const enrichedAgents = await Promise.all(
        basicAgents.map(async (agent) => {
          const onchain = await fetchAgentDetailsViaObject(client, agent.object_id)

          const status: AgentDetails['status'] = defeatedAgentIds.has(String(agent.agent_id))
            ? 'Defeated'
            : 'Active'

          return {
            ...agent,
            ...onchain,
            status,
          }
        })
      )

      return enrichedAgents
    },
  })
}
