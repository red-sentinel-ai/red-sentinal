import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

export interface PrizePoolHistory {
  history: { time: string; value: number }[]
  change7d: {
    percentage: number | null
    absolute: number
  }
}

export interface AgentDetails {
  agent_id: string
  agent_name: string | null
  prompt: string
  agent_image: string | null
  creator: string
  cost_per_message: string
  total_balance: string
  agent_object_id: string
  is_featured: boolean
  model_name: string | null
  model_provider: string | null
  state: 'active' | 'defeated'
  total_attacks: number
  prizePoolHistory?: PrizePoolHistory | null
  sender?: string
  timestampMs?: string
  // Derived
  agent_path: string
  // On-chain fields (only available on single agent pages)
  last_funded_timestamp?: string
  accumulated_fees?: number
}

export const ALL_AGENTS_QUERY_KEY = 'allAgents'

export const useAllAgents = () => {
  return useQuery<AgentDetails[], Error>({
    queryKey: [ALL_AGENTS_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?limit=200&include_prize_pool=true`
      )
      if (!res.ok) {
        throw new Error('Failed to fetch agents')
      }
      const { agents } = await res.json()
      return agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: agent.agent_name
          ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
          : agent.agent_object_id,
      }))
    },
    staleTime: 60 * 1000,
  })
}
