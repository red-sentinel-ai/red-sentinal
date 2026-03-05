import { useQuery } from '@tanstack/react-query'
import type { PublicStats } from '@/types/Earn'
import { APP_NETWORK } from '@/constants'

// Mock data for now - will be replaced when API is ready
const MOCK_STATS: PublicStats = {
  totalDistributed: 12_450_000,
  activeMissions: 14,
  biggestSpinThisWeek: 97_800,
}

async function fetchPublicStats(): Promise<PublicStats> {
  // TODO: Replace with real API call when endpoint is ready
  // const response = await fetch(`${API_URL}/stats/${APP_NETWORK}/rewards`)
  // if (!response.ok) throw new Error('Failed to fetch public stats')
  // return response.json()

  // For now, return mock data
  return new Promise(resolve => {
    setTimeout(() => resolve(MOCK_STATS), 500)
  })
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats', APP_NETWORK],
    queryFn: fetchPublicStats,
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000, // Refetch every minute
  })
}
