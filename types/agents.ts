import type { SupportedChain } from '@/constants/chains'

export interface PrizePoolHistory {
  history: { time: string; value: number }[]
  change7d: {
    percentage: number | null
    absolute: number
  }
}

export interface AgentWinner {
  address: string
  amount_won: string
  tx_digest?: string | null
}

export interface Agent {
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
  // Derived client-side
  agent_path: string
  prizePoolHistory?: PrizePoolHistory | null
  sender?: string
  timestampMs?: string | null
  last_funded_timestamp?: string | null
  unlock_timestamp?: string | null
  accumulated_fees?: number
  coin_type?: string
  current_cost_per_message?: string
  chain?: SupportedChain
  winner?: AgentWinner | null
  // Trending fields (top 8 agents only)
  trending?: boolean
  trending_rank?: number | null
  // Fields only populated by the /details endpoint (single agent page)
  deployment_tx_hash?: string | null
  participants_count?: number
  attack_goal?: string | null
  casual_network?: string
  defender_profile?: { username: string | null; avatar_url: string | null } | null
  syndicate?: {
    contract_address: string
    name: string
    syndicate_path: string | null
  } | null
}

export type SortField =
  | 'total_balance'
  | 'cost_per_message'
  | 'total_attacks'
  | 'agent_id'
  | null

export type SortDirection = 'asc' | 'desc'
