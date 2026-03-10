import { useQuery } from '@tanstack/react-query'
import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'

export interface MilestoneThreshold {
  target: number
  awarded: boolean
  tier: string
}

export interface DefenderMissionsResponse {
  milestones: {
    attacksSurvived: {
      current: number
      thresholds: MilestoneThreshold[]
    }
    undefeatedStreak: {
      currentDays: number
      thresholds: MilestoneThreshold[]
    }
    leaderboard: {
      currentRank: number | null
      top10Achieved: boolean
      monthlyRank1AchievedAt: string | null
    }
  }
  staking: {
    poolSizeSui: number
    durationDays: number
    durationMultiplier: number
    defenseMultiplier: number
    estimatedDailyReward: number
    lastPaidDate: string | null
    totalStakingEarned: number
  }
}

export interface StakingHistoryRecord {
  date: string
  poolSizeSui: number
  durationDays: number
  durationMultiplier: number
  defenseMultiplier: number
  dailyRewardAmount: number
  transferSuccess: boolean
  transferDigest: string | null
  createdAt: string
}

export function useDefenderMissions(walletAddress: string | undefined) {
  return useQuery<DefenderMissionsResponse>({
    queryKey: ['defender-missions', walletAddress, APP_NETWORK],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/defenders/${APP_NETWORK}/missions/${walletAddress}`
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch defender missions')
      }
      return res.json()
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min (same as cron cadence)
  })
}

export function useStakingHistory(
  walletAddress: string | undefined,
  limit = 30,
  offset = 0
) {
  return useQuery<{ records: StakingHistoryRecord[]; total: number; limit: number; offset: number }>({
    queryKey: ['staking-history', walletAddress, APP_NETWORK, limit, offset],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/defenders/${APP_NETWORK}/staking-history/${walletAddress}?limit=${limit}&offset=${offset}`
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch staking history')
      }
      return res.json()
    },
    enabled: !!walletAddress,
    staleTime: 60 * 1000,
  })
}
