import { useQuery } from '@tanstack/react-query'

export const AGENT_EVENTS_FROM_INDEXER_QUERY_KEY = 'agentEventsFromIndexer'

export interface PromptConsumedEvent {
  agent_id: string
  success: boolean
  amount: string
  sender: string
  message: string
  agent_response: string
  score: number
  jury_response?: string
  timestampMs?: string
  tx_digest?: string
}

export interface AgentDefeatedEvent {
  agent_id: string
  winner: string
  score: number
  amount_won: string
  timestampMs?: string
  tx_digest?: string
}

export interface AgentEventsFromIndexer {
  agentDefeated: AgentDefeatedEvent[]
  promptConsumed: PromptConsumedEvent[]
}

interface PromptsConsumedApiResponse {
  result: PromptConsumedEvent[]
}

interface DefeatEventsApiResponse {
  result: AgentDefeatedEvent[]
}

const INDEXER_API_BASE_URL = 'https://api.suisentinel.xyz/agents/mainnet'

async function fetchPromptsConsumed(agentId: string): Promise<PromptConsumedEvent[]> {
  const response = await fetch(`${INDEXER_API_BASE_URL}/${agentId}/prompts_consumed`)
  if (!response.ok) {
    throw new Error(`Failed to fetch prompts consumed: ${response.statusText}`)
  }
  const data: PromptsConsumedApiResponse = await response.json()
  return data.result || []
}

async function fetchDefeatEvents(agentId: string): Promise<AgentDefeatedEvent[]> {
  const response = await fetch(`${INDEXER_API_BASE_URL}/${agentId}/defeat_events`)
  if (!response.ok) {
    throw new Error(`Failed to fetch defeat events: ${response.statusText}`)
  }
  const data: DefeatEventsApiResponse = await response.json()
  return data.result || []
}

export function useAgentEventsFromIndexer(agentId?: string) {
  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AgentEventsFromIndexer, Error>({
    queryKey: [AGENT_EVENTS_FROM_INDEXER_QUERY_KEY, agentId],
    queryFn: async () => {
      if (!agentId) {
        return { agentDefeated: [], promptConsumed: [] }
      }
      const [promptConsumed, agentDefeated] = await Promise.all([
        fetchPromptsConsumed(agentId),
        fetchDefeatEvents(agentId),
      ])
      return { promptConsumed, agentDefeated }
    },
    enabled: !!agentId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 20 * 1000, // Refetch every 20 seconds
    refetchIntervalInBackground: false, // Only refetch when tab is active
    refetchOnWindowFocus: true, // Refetch when window regains focus
  })

  return {
    events: events || { agentDefeated: [], promptConsumed: [] },
    loading: isLoading,
    error: isError ? error.message : null,
    refetch,
  }
}
