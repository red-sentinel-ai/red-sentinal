import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import { deriveAgentPath } from '@/lib/utils'
import type { SupportedChain } from '@/constants/chains'

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
  winner?: {
    address: string
    amount_won: string
    tx_digest?: string | null
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

export const ALL_AGENTS_QUERY_KEY = 'allAgents'
export const AGENTS_LIMIT = 20

interface AgentsResponse {
  agents: AgentDetails[]
  total: number
  hasMore: boolean
}

// chainOverride: undefined = use active chain, null = show all chains, SupportedChain = specific chain
export const useAllAgents = (
  sortField: SortField = 'total_balance',
  sortDirection: SortDirection = 'desc',
  coinTypeFilter?: string,
  chainOverride?: SupportedChain | null
) => {
  const { activeChain } = useActiveChain()
  const chainFilter = chainOverride === undefined ? activeChain : chainOverride ?? undefined

  return useInfiniteQuery<AgentsResponse, Error>({
    queryKey: [ALL_AGENTS_QUERY_KEY, sortField, sortDirection, coinTypeFilter, chainFilter ?? 'all'],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number

      const params = new URLSearchParams({
        limit: String(AGENTS_LIMIT),
        offset: String(offset),
        min_balance: '1',
      })

      if (chainFilter) params.append('chain', chainFilter)
      if (sortField) {
        params.append('sortBy', sortField)
        params.append('sortDirection', sortDirection)
      }
      if (coinTypeFilter) params.append('coin_type', coinTypeFilter)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch agents')

      const data = await res.json()
      const agents = data.agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: deriveAgentPath(agent),
      }))

      const total = data.total ?? agents.length
      return {
        agents,
        total,
        hasMore: offset + agents.length < total,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined
      return allPages.length * AGENTS_LIMIT
    },
    staleTime: 60 * 1000,
  })
}
