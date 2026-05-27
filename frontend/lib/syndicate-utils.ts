import type { SyndicateMemberDetail } from '@/types/Syndicate'

export function getDecimalsForSymbol(symbol: string): number {
  const map: Record<string, number> = { USDC: 18, USDT: 18, WBNB: 18, BNB: 18 }
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
