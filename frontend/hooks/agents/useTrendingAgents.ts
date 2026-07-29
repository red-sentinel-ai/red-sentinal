import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import type { Agent } from '@/types/agents'

export const TRENDING_AGENTS_QUERY_KEY = 'trendingAgents'

export const MAX_TRENDING_SENTINELS = 8

const TRENDING_STALE_TIME_MS = 15 * 60 * 1000

export const useTrendingAgents = (showAllChains?: boolean) => {
  const { activeChain } = useActiveChain()
  const chainFilter = showAllChains ? undefined : activeChain

  return useQuery<Agent[], Error>({
    queryKey: [TRENDING_AGENTS_QUERY_KEY, chainFilter ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        trending: 'true',
        status: 'active',
        min_balance: '1',
        limit: String(MAX_TRENDING_SENTINELS),
      })
      if (chainFilter) params.append('chain', chainFilter)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch trending agents')

      const { agents } = await res.json()
      return (agents as Agent[]).sort(
        (a, b) => (a.trending_rank ?? Infinity) - (b.trending_rank ?? Infinity)
      )
    },
    staleTime: TRENDING_STALE_TIME_MS,
  })
}
