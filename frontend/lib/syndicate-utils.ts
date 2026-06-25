import { getTokenForCoinType } from '@/constants/tokens'
import type { BackendSyndicate, SyndicateMemberDetail } from '@/types/syndicate'

export function getSyndicateIdlePrincipalWei(meta: BackendSyndicate): bigint {
  return (
    BigInt(meta.total_funds) -
    (BigInt(meta.agent_initial_fund) +
      BigInt(meta.agent_total_funded) -
      BigInt(meta.agent_total_withdrawn))
  )
}

export function getSyndicateBasePath(
  syndicate: Pick<BackendSyndicate, 'syndicate_path' | 'contract_address'>
): string {
  return syndicate.syndicate_path ?? `/syndicate/${syndicate.contract_address}`
}

export function getMaxRedeemableSharesWei(args: {
  shares: bigint | undefined
  totalShares: bigint | undefined
  totalManagedAssets: bigint | undefined
  idlePrincipal: bigint | undefined
}): bigint | undefined {
  const { shares, totalShares, totalManagedAssets, idlePrincipal } = args
  if (
    shares === undefined ||
    totalShares === undefined ||
    totalManagedAssets === undefined ||
    idlePrincipal === undefined
  ) {
    return undefined
  }
  if (totalShares === 0n || totalManagedAssets <= 0n) return 0n
  const maxByLiquidity = (idlePrincipal * totalShares) / totalManagedAssets
  return shares < maxByLiquidity ? shares : maxByLiquidity
}

export function getDecimalsForSymbol(symbol: string, tokenAddress?: string): number {
  if (tokenAddress) {
    const token = getTokenForCoinType(tokenAddress)
    if (token.symbol === symbol) return token.decimals
  }
  const map: Record<string, number> = { USDC: 6, USDT: 6, WBNB: 18, BNB: 18 }
  return map[symbol] ?? 18
}

export function parseAddresses(input: string): `0x${string}`[] {
  return input
    .split(/[\n,]+/)
    .map(a => a.trim())
    .filter(a => a.startsWith('0x') && a.length === 42) as `0x${string}`[]
}

/**
 * Synthesize a member row when the backend response predates `members_detailed`.
 * All numeric fields stay 0 — the table renders gracefully without per-member data.
 */
export function buildFallbackMember(
  address: string,
  owner: string
): SyndicateMemberDetail {
  const isOwner = address.toLowerCase() === owner.toLowerCase()
  return {
    address: address.toLowerCase(),
    is_owner: isOwner,
    designation: isOwner ? 'SYNDICATE_OWNER' : 'MEMBER',
    shares: '0',
    deposited: '0',
    redeemed: '0',
    net_deposited: '0',
    fees_claimed: '0',
    deposits_count: 0,
    redemptions_count: 0,
    equity_share: 0,
    first_deposit_at: null,
    last_activity_at: null,
    username: null,
    avatar_url: null,
    twitter_username: null,
    twitter_avatar: null,
    discord_username: null,
    discord_avatar: null,
  }
}
