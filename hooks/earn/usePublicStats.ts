import type { PublicStats } from '@/types/Earn'
import { usePlatformStats } from '@/hooks/stats/usePlatformStats'
import { useSpinFeed } from '@/hooks/rewards/useSpinFeed'
import { ACTIVE_MISSIONS_COUNT } from '@/lib/earn-utils'

export function usePublicStats(): { data: PublicStats | undefined; isLoading: boolean } {
  const { data: platformData, isLoading: platformLoading } = usePlatformStats()
  const { data: spinData, isLoading: spinLoading } = useSpinFeed()
  console.log({spinData})

  const isLoading = platformLoading || spinLoading

  if (!platformData) return { data: undefined, isLoading }

  return {
    isLoading,
    data: {
      totalDistributed: platformData.totalSentinelTokensDistributed,
      activeMissions: ACTIVE_MISSIONS_COUNT,
      totalSpins: spinData?.total ?? spinData?.spins.length ?? 0,
    },
  }
}
