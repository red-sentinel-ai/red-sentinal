import { SuiClient } from '@mysten/sui/client'
import { AgentDetails } from '@/types'
import { SUI_CONFIG } from '@/constants'

export const fetchAgentDetailsViaObject = async (
  client: SuiClient,
  agentObjectId: string
): Promise<AgentDetails> => {
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
      agent_name: '',
      agent_id: fields.agent_id,
      agent_object_id: fields.id.id,
      creator: fields.creator,
      cost_per_message: Number(fields.cost_per_message),
      system_prompt: fields.system_prompt,
      balance: Number(fields.balance),
      is_featured: false,
      agent_profile: '',
    }
  } catch (error) {
    console.error('Error fetching agent via getObject:', error)
    throw new Error('Failed to fetch agent details via object query')
  }
}

export async function getDefeatedAgentIds(client: SuiClient): Promise<Set<string>> {
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
