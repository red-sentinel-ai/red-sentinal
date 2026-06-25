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
  // Derived client-side
  agent_path: string
  // On-chain fields (only available on single agent pages)
  last_funded_timestamp?: string
  unlock_timestamp?: string
  accumulated_fees?: number
  coin_type?: string
  current_cost_per_message?: string
  chain?: SupportedChain
  // Trending (top 10, best available window: 24h → 7d → 30d)
  trending?: boolean
  trending_rank?: number | null
  trending_window?: '24h' | '7d' | '30d' | null
  // Present only when state === 'defeated'
  winner?: AgentWinner | null
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
  deployment_tx_hash: string | null
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
  current_cost_per_message?: string
  chain?: SupportedChain
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
  | 'state'
  | null

export type SortDirection = 'asc' | 'desc'
