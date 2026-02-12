import { SuiClient } from '@mysten/sui/client'

interface OnChainAgentDetails {
  cost_per_message: number
  prompt: string
  balance: number
  last_funded_timestamp: string
  accumulated_fees: number
  is_defeated: boolean
}

export const fetchAgentOnChainDetails = async (
  client: SuiClient,
  agentObjectId: string
): Promise<OnChainAgentDetails> => {
  try {
    const response = await client.getObject({
      id: agentObjectId,
      options: {
        showContent: true,
      },
    })

    if (!response.data?.content || response.data.content.dataType !== 'moveObject') {
      throw new Error('Invalid agent object')
    }

    const fields = (response.data.content as any).fields

    return {
      cost_per_message: Number(fields.cost_per_message),
      prompt: fields.system_prompt,
      balance: Number(fields.balance),
      last_funded_timestamp: fields.last_funded_timestamp || '0',
      accumulated_fees: Number(fields.accumulated_fees || 0),
      is_defeated: fields.is_defeated || false,
    }
  } catch (error) {
    console.error(`Error fetching on-chain details for ${agentObjectId}:`, error)
    return {
      cost_per_message: 0,
      prompt: 'Error fetching on-chain data.',
      balance: 0,
      last_funded_timestamp: '0',
      accumulated_fees: 0,
      is_defeated: false,
    }
  }
}
