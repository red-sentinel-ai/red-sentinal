import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useActiveChain } from '@/context/ActiveChainContext'
import type { Agent } from '@/types/agents'

export const DEFEATED_AGENTS_QUERY_KEY = 'defeatedAgents'

export const MAX_BROKEN_SENTINELS = 4

const DEFEATED_STALE_TIME_MS = 5 * 60 * 1000

/** Payout a defeated sentinel's pool reached — total_balance is 0 once the
 *  bounty is paid out, so the winner's amount is the final pool. */
export function finalPool(agent: Agent): number {
  return Number(agent.winner?.amount_won ?? agent.total_balance)
}

export const useDefeatedAgents = (showAllChains?: boolean) => {
  const { activeChain } = useActiveChain()
  const chainFilter = showAllChains ? undefined : activeChain

  return useQuery<Agent[], Error>({
    queryKey: [DEFEATED_AGENTS_QUERY_KEY, chainFilter ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: 'defeated',
        limit: String(MAX_BROKEN_SENTINELS),
      })
      if (chainFilter) params.append('chain', chainFilter)

      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}?${params.toString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch defeated agents')

      const { agents } = await res.json()
      return (agents as Agent[]).sort((a, b) => finalPool(b) - finalPool(a))
    },
    staleTime: DEFEATED_STALE_TIME_MS,
  })
}
