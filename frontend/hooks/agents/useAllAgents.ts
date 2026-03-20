import { useInfiniteQuery } from '@tanstack/react-query'
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
  unlock_timestamp?: string
  accumulated_fees?: number
  coin_type?: string
  current_cost_per_message?: string 
}

export type SortField = 'total_balance' | 'cost_per_message' | 'total_attacks' | 'agent_id' | 'change7d' | null
export type SortDirection = 'asc' | 'desc'

export const ALL_AGENTS_QUERY_KEY = 'allAgents'
export const AGENTS_LIMIT = 20

interface AgentsResponse {
  agents: AgentDetails[]
  total: number
  hasMore: boolean
}

export const useAllAgents = (
  sortField: SortField = 'total_balance',
  sortDirection: SortDirection = 'desc'
) => {
  return useInfiniteQuery<AgentsResponse, Error>({
    queryKey: [ALL_AGENTS_QUERY_KEY, sortField, sortDirection],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number

      // Build query params
      const params = new URLSearchParams({
        limit: String(AGENTS_LIMIT),
        offset: String(offset),
        include_prize_pool: 'true',
        min_balance: '1000000000',
      })

      // Add sort params if provided
      if (sortField) {
        // Map frontend sort field names to API field names
        const apiSortField = sortField === 'change7d' ? 'prize_pool_change_7d' : sortField
        params.append('sortBy', apiSortField)
        params.append('sortDirection', sortDirection)
      }

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch agents')
      }

      const data = await res.json()
      const agents = data.agents.map((agent: AgentDetails) => ({
        ...agent,
        agent_path: agent.agent_name
          ? agent.agent_name.toLowerCase().replace(/\s+/g, '_')
          : agent.agent_object_id,
      }))

      return {
        agents,
        total: data.total || agents.length,
        hasMore: agents.length === AGENTS_LIMIT,
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
