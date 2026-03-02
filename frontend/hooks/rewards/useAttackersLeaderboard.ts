import { useInfiniteQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { AttackerEntry } from '@/components/rewards/NewLeaderboard'

interface AttackersResponse {
  attackers: ApiAttackerEntry[]
  total: number
  limit: number
  offset: number
  lastComputedAt: string | null
}

interface ApiAttackerEntry {
  rank: number
  wallet: string
  attackerTier: string
  totalBountySui: number
  successfulBreaches: number
  totalAttacks: number
  breachRatePct: number
  largestBountySui: number
  sentinelTokensEarned: number
  lastActiveTimestamp: string | null
  attackStreakDays: number
  computedAt: string | null
  username?: string | null
  avatar_url?: string | null
  wallet_addresses?: string[]
}

export function mapApiAttacker(entry: ApiAttackerEntry, connectedWallet?: string): AttackerEntry {
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
    attackerTier: entry.attackerTier as AttackerEntry['attackerTier'],
    totalBountyWonSui: entry.totalBountySui,
    successfulBreaches: entry.successfulBreaches,
    totalAttacksSent: entry.totalAttacks,
    breachRatePct: entry.breachRatePct,
    largestSingleBountySui: entry.largestBountySui,
    attackStreakDays: entry.attackStreakDays ?? 0,
    sentinelTokensEarned: entry.sentinelTokensEarned,
    lastActiveTimestamp: entry.lastActiveTimestamp ?? new Date(0).toISOString(),
    isCurrentUser,
  }
}

export function useAttackersLeaderboard(limit = 25, search = '', tier = '') {
  return useInfiniteQuery({
    queryKey: ['attackers-leaderboard', limit, search, tier],
    queryFn: async ({ pageParam = 0 }): Promise<AttackersResponse> => {
      const url = new URL(`${SUI_SENTINEL_API_URL}/leaderboard/v2/${APP_NETWORK}/attackers`)
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('offset', String(pageParam))
      if (search) url.searchParams.set('search', search)
      if (tier) url.searchParams.set('tier', tier)

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch attackers leaderboard')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.attackers.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
