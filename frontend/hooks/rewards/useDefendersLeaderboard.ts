import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { DefenderEntry } from '@/components/rewards/NewLeaderboard'

interface DefendersResponse {
  defenders: ApiDefenderEntry[]
  total: number
  limit: number
  offset: number
  lastComputedAt: string | null
}

interface ApiDefenderEntry {
  rank: number
  wallet: string
  compositeScore: number
  defenderTier: string
  tvlUsd: number
  activeSentinels: number
  totalSentinels: number
  longestSurvivingHours: number
  totalAttacksSurvived: number
  breachRatePct: number
  totalFeesEarnedUsd: number
  sentinelTokensEarned: number
  computedAt: string | null
  username?: string | null
  avatar_url?: string | null
  wallet_addresses?: string[]
  twitter_username?: string | null
  twitter_user_id?: string | null
  twitter_avatar?: string | null
}

export function mapApiDefender(entry: ApiDefenderEntry, connectedWallet?: string): DefenderEntry {
  const wallet = entry.wallet ?? ''
  const displayName = entry.username || `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
  const walletAddresses = entry.wallet_addresses || [wallet]
  const isCurrentUser = connectedWallet
    ? walletAddresses.some(w => w.toLowerCase() === connectedWallet.toLowerCase())
    : false

  return {
    rank: entry.rank,
    userId: wallet,
    username: displayName,
    walletAddress: wallet,
    avatarUrl: entry.avatar_url ?? undefined,
    compositeScore: entry.compositeScore,
    defenderTier: entry.defenderTier as DefenderEntry['defenderTier'],
    tvlUsd: entry.tvlUsd,
    activeSentinels: entry.activeSentinels,
    totalSentinelsDeployed: entry.totalSentinels,
    longestSurvivingHours: entry.longestSurvivingHours,
    totalAttacksSurvived: entry.totalAttacksSurvived,
    breachRatePct: entry.breachRatePct,
    totalFeesEarnedUsd: entry.totalFeesEarnedUsd,
    sentinelTokensEarned: entry.sentinelTokensEarned,
    isCurrentUser,
  }
}

export function useDefendersLeaderboard(limit = 25, search = '', tier = '') {
  return useInfiniteQuery({
    queryKey: ['defenders-leaderboard', limit, search, tier],
    queryFn: async ({ pageParam = 0 }): Promise<DefendersResponse> => {
      const url = new URL(`${SUI_SENTINEL_API_URL}/leaderboard/v2/${APP_NETWORK}/defenders`)
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('offset', String(pageParam))
      if (search) url.searchParams.set('search', search)
      if (tier) url.searchParams.set('tier', tier)

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch defenders leaderboard')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.defenders.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
