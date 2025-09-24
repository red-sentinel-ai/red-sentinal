/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClient } from '@mysten/dapp-kit'
import { SuiClient } from '@mysten/sui/client'
import { useQuery } from '@tanstack/react-query'
import { SUI_CONFIG } from '@/constants'

export interface AgentEvents {
  agentDefeated: any[]
  promptConsumed: any[]
}

export const AGENT_EVENTS_QUERY_KEY = 'agentEvents'

export function useAgentEvents() {
  const client = useSuiClient()

  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AgentEvents, Error>({
    queryKey: [AGENT_EVENTS_QUERY_KEY],
    queryFn: () => getAgentEvents(client),
    staleTime: 60 * 1000,
  })

  return {
    events: events || { agentDefeated: [], promptConsumed: [] },
    loading: isLoading,
    error: isError ? error.message : null,
    refetch,
  }
}
async function getAgentEvents(client: SuiClient) {
  const packageId = SUI_CONFIG.EXAMPLES_PACKAGE_ID
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
