import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { Agent, SortField, SortDirection } from '@/types/agents'
import type { SentinelStatusFilter } from '@/lib/sentinel-status'
import type { SupportedChain } from '@/constants/chains'

export const ALL_AGENTS_QUERY_KEY = 'allAgents'
export const AGENTS_LIMIT = 20

interface AgentsPage {
  agents: Agent[]
  total: number
  hasMore: boolean
}

export interface UseAllAgentsOptions {
  sortField?: SortField
  sortDirection?: SortDirection
  coinTypeFilter?: string
  chain?: SupportedChain
  status?: SentinelStatusFilter
  /** Tag slug — filtered server-side so results span all pages, not just loaded ones. */
  tag?: string
}

export const useAllAgents = ({
  sortField = 'total_balance',
  sortDirection = 'desc',
  coinTypeFilter,
  chain,
  status = 'all',
  tag,
}: UseAllAgentsOptions = {}) => {
  return useInfiniteQuery<AgentsPage, Error>({
    queryKey: [
      ALL_AGENTS_QUERY_KEY,
      sortField,
      sortDirection,
      coinTypeFilter,
      chain ?? 'all',
      status,
      tag ?? 'all',
    ],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number

      const params = new URLSearchParams({
        limit: String(AGENTS_LIMIT),
        offset: String(offset),
      })

      if (chain) params.append('chain', chain)
      if (sortField) {
        params.append('sortBy', sortField)
        params.append('sortDirection', sortDirection)
      }
      if (coinTypeFilter) params.append('coin_type', coinTypeFilter)
      if (status !== 'all') params.append('status', status)
      if (tag) params.append('tag', tag)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch agents')

      const data = await res.json()
      const total = data.total ?? data.agents.length
      return {
        agents: data.agents as Agent[],
        total,
        hasMore: offset + data.agents.length < total,
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
