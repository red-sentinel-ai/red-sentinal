import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

export interface PromptChatEvent {
  type: 'prompt'
  id: string
  sender: string
  content: string
  agent_response: string
  score: number
  success: boolean
  tx_digest: string
  amount_sent: string
  jury_response: string | null
  timestamp: string
}

export interface DefeatChatEvent {
  type: 'defeat'
  id: string
  winner: string
  amount_won: string
  tx_digest: string
  timestamp: string
}

export type ChatEvent = PromptChatEvent | DefeatChatEvent

export interface AgentChatHistory {
  messages: ChatEvent[]
  total: number
}

export const AGENT_CHAT_QUERY_KEY = 'agentChat'

export function useAgentChatHistory(agentId?: string) {
  return useQuery<AgentChatHistory>({
    queryKey: [AGENT_CHAT_QUERY_KEY, agentId, APP_NETWORK],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/${agentId}/chat`
      )
      if (!res.ok) throw new Error('Failed to fetch chat history')
      return res.json()
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    enabled: !!agentId,
  })
}
