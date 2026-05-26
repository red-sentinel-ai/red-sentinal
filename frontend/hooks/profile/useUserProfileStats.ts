import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'

export interface UserProfileStats {
  // Attacker stats
  totalBountyWonUsd: number
  totalAttacks: number
  successfulBreaches: number
  attackerTier: string | null
  // Defender stats
  totalAttacksSurvived: number
  activeSentinels: number
  totalSentinels: number
  defenderTier: string | null
}

interface ApiAttackerEntry {
  wallet: string
  totalBountyUsd: number
  successfulBreaches: number
  totalAttacks: number
  attackerTier: string
}

interface ApiDefenderEntry {
  wallet: string
  totalAttacksSurvived: number
  activeSentinels: number
  totalSentinels: number
  defenderTier: string
}

interface AttackersResponse {
  attackers: ApiAttackerEntry[]
}

interface DefendersResponse {
  defenders: ApiDefenderEntry[]
}

async function fetchUserStats(walletAddress: string): Promise<UserProfileStats> {
  // Fetch attacker stats
  const attackerUrl = new URL(`${SUI_SENTINEL_API_URL}/leaderboard/v2/${APP_NETWORK}/attackers`)
  attackerUrl.searchParams.set('search', walletAddress)
  attackerUrl.searchParams.set('limit', '1')

  // Fetch defender stats
  const defenderUrl = new URL(`${SUI_SENTINEL_API_URL}/leaderboard/v2/${APP_NETWORK}/defenders`)
  defenderUrl.searchParams.set('search', walletAddress)
  defenderUrl.searchParams.set('limit', '1')

  const [attackerRes, defenderRes] = await Promise.all([
    fetch(attackerUrl.toString()),
    fetch(defenderUrl.toString()),
  ])

  const attackerData: AttackersResponse = attackerRes.ok ? await attackerRes.json() : { attackers: [] }
  const defenderData: DefendersResponse = defenderRes.ok ? await defenderRes.json() : { defenders: [] }

  const attacker = attackerData.attackers?.[0]
  const defender = defenderData.defenders?.[0]

  return {
    totalBountyWonUsd: attacker?.totalBountyUsd ?? 0,
    totalAttacks: attacker?.totalAttacks ?? 0,
    successfulBreaches: attacker?.successfulBreaches ?? 0,
    attackerTier: attacker?.attackerTier ?? null,
    totalAttacksSurvived: defender?.totalAttacksSurvived ?? 0,
    activeSentinels: defender?.activeSentinels ?? 0,
    totalSentinels: defender?.totalSentinels ?? 0,
    defenderTier: defender?.defenderTier ?? null,
  }
}

export function useUserProfileStats() {
  const { address } = useConnectedAddress()

  return useQuery<UserProfileStats>({
    queryKey: ['user-profile-stats', address],
    queryFn: () => fetchUserStats(address!),
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
