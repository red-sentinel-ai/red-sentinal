import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'

export interface UserProfileStats {
  // Attacker stats
  totalBountyUsd: number
  totalAttacks: number
  successfulBreaches: number
  attackerTier: string | null
  attackerRank: number | null
  breachRatePct: number
  largestBountyUsd: number
  sentinelTokensEarnedAttacker: number
  // Defender stats
  totalAttacksSurvived: number
  activeSentinels: number
  totalSentinels: number
  defenderTier: string | null
  defenderRank: number | null
  compositeScore: number
  tvlUsd: number
  totalFeesEarnedUsd: number
  sentinelTokensEarnedDefender: number
}

async function fetchUserStats(walletAddress: string): Promise<UserProfileStats> {
  const url = `${SUI_SENTINEL_API_URL}/leaderboard/v2/${APP_NETWORK}/user-stats/${walletAddress}`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`Failed to fetch user stats: ${res.status}`)
  return res.json()
}

export function useUserProfileStats(walletAddress?: string) {
  return useQuery<UserProfileStats>({
    queryKey: ['user-profile-stats', walletAddress, APP_NETWORK],
    queryFn: () => fetchUserStats(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
