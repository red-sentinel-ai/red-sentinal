import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

export interface PrizePoolHistory {
  history: { time: string; value: number }[]
  change7d: { percentage: number | null; absolute: number }
}

export interface AgentWinner {
  address: string
  amount_won: string
  tx_digest?: string | null
}

export interface AgentDetailsFull {
  agent_id: string
  agent_name: string | null
  agent_image: string | null
  prompt: string
  creator: string
  cost_per_message: string
  total_balance: string
  agent_object_id: string
  is_featured: boolean
  model_name: string | null
  model_provider: string | null
  state: 'active' | 'defeated'
  total_attacks: number
  participants_count: number
  agent_path: string
  last_funded_timestamp: string | null
  unlock_timestamp: string | null
  accumulated_fees?: number
  timestampMs: string | null
  winner: AgentWinner | null
  attack_goal: string | null
  defender_profile: { username: string | null; avatar_url: string | null } | null
  prizePoolHistory: PrizePoolHistory | null
  coin_type?: string
}

export const AGENT_DETAILS_FULL_QUERY_KEY = 'agentDetailsFull'

export function useAgentDetails(slug?: string) {
  return useQuery<AgentDetailsFull>({
    queryKey: [AGENT_DETAILS_FULL_QUERY_KEY, slug, APP_NETWORK],
    queryFn: async () => {
      let normalizedSlug: string
      try {
        normalizedSlug = decodeURIComponent(slug!)
      } catch {
        normalizedSlug = slug!
      }
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/details?agent_path=${encodeURIComponent(normalizedSlug)}`
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch agent details')
      }
      const data = await res.json()
      if (data.accumulated_fees != null) {
        data.accumulated_fees = Number(data.accumulated_fees)
      }
      return data
    },
    staleTime: 30_000,
    enabled: !!slug,
  })
}
