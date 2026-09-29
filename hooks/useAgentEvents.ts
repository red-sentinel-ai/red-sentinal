/* eslint-disable @typescript-eslint/no-explicit-any */
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { useQuery } from '@tanstack/react-query'
import { APP_NETWORK, SUI_CONFIG } from '@/constants'
import { SUI_EVENTS_RPC_URLS } from '@/constants/sui-rpc'
import { createSuiClient } from '@/lib/sui/rpc-client'

export interface AgentEvents {
  agentDefeated: any[]
  promptConsumed: any[]
}

export const AGENT_EVENTS_QUERY_KEY = 'agentEvents'

const eventsClient = createSuiClient(SUI_EVENTS_RPC_URLS[APP_NETWORK], APP_NETWORK)

export function useAgentEvents() {

  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AgentEvents, Error>({
    queryKey: [AGENT_EVENTS_QUERY_KEY],
    queryFn: () => getAgentEvents(eventsClient),
    staleTime: 60 * 1000,
  })

  return {
    events: events || { agentDefeated: [], promptConsumed: [] },
    loading: isLoading,
    error: isError ? error.message : null,
    refetch,
  }
}
async function getAgentEvents(client: SuiJsonRpcClient) {
  const packageId = SUI_CONFIG.APP_PACKAGE_ID
  const moduleName = SUI_CONFIG.MODULE_NAME
  try {
    // Fetch AgentDefeated events
    const agentDefeatedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::AgentDefeated`,
      },
      limit: 50,
      order: 'descending',
    })

    // Fetch PromptConsumed events
    const promptConsumedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::PromptConsumed`,
      },
      limit: 50,
      order: 'descending',
    })

    return {
      agentDefeated: agentDefeatedEvents.data,
      promptConsumed: promptConsumedEvents.data,
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}
