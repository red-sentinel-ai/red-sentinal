import type { PublicStats } from '@/types/Earn'
import { usePlatformStats } from '@/hooks/stats/usePlatformStats'

export function usePublicStats(): { data: PublicStats | undefined; isLoading: boolean } {
  const { data, isLoading } = usePlatformStats()

  if (!data) return { data: undefined, isLoading }

  return {
    isLoading,
    data: {
      totalDistributed: data.totalSentinelTokensDistributed,
      // activeMissions and biggestSpinThisWeek don't have backend endpoints yet
      activeMissions: 14,
      biggestSpinThisWeek: 0,
    },
  }
}
