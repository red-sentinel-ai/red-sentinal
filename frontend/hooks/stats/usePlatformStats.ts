import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK, MIST_PER_SUI } from '@/constants'

export interface PlatformStatsResponse {
  network: string
  computedAt: string
  totalAttacks: number
  totalSentinelsLaunched: number
  activeSentinels: number
  defeatedSentinels: number
  totalBountyWon: string
  totalSentinelTokensDistributed: number
  tvl: string
  largestBountyWon: {
    agentId: string
    winner: string
    amount: string
    timestamp: string
  } | null
}

export function mistToSui(mist: string): number {
  return Math.ceil(Number(mist) / MIST_PER_SUI)
}

export function usePlatformStats(network = APP_NETWORK) {
  return useQuery<PlatformStatsResponse>({
    queryKey: ['platform-stats', network],
    queryFn: async () => {
      const res = await fetch(`${SUI_SENTINEL_API_URL}/stats/${network}`)
      if (!res.ok) throw new Error('Failed to fetch platform stats')
      return res.json()
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
