import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import { deriveAgentPath } from '@/lib/utils'
import type { Agent, SortField, SortDirection } from '@/types/agents'
import type { SupportedChain } from '@/constants/chains'

export const ALL_AGENTS_QUERY_KEY = 'allAgents'
export const AGENTS_LIMIT = 20

interface AgentsResponse {
  agents: Agent[]
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
      const agents = data.agents.map((agent: Agent) => ({
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
