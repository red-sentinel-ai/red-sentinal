/**
 * Public Tag Page API contracts (WO-19 backend, WO-20 rendering).
 * Shapes mirror the backend `routes/tag-pages` response schemas.
 */

export interface TagPageIdentity {
  tagId: string
  name: string
  slug: string
}

export interface TagPageMetadata {
  title: string
  description: string | null
  hero_image_url: string | null
  share_copy: string | null
}

export interface TagActivitySummary {
  totalAttacks: number
  tagDefenders: number
  sentinelsLaunched: number
  attackedTagDefenders: number
  breachedSentinels: number
  breachRatePct: number
  activeSentinels: number
  bountyPaidUsd: number
}

export interface TagDefenderEntry {
  rank: number
  wallet: string
  compositeScore: number
  sentinelsLaunched: number
  attacksOnSentinels: number
  attacksSurvived: number
  breachedSentinels: number
  activeSentinels: number
  breachRatePct: number
  bountyPaidUsd: number
  username?: string | null
  avatar_url?: string | null
  wallet_addresses?: string[]
  twitter_username?: string | null
  discord_username?: string | null
}

export interface TagAttackerEntry {
  rank: number
  wallet: string
  compositeScore: number
  totalAttacks: number
  successfulBreaches: number
  breachRatePct: number
  bountyWonUsd: number
  largestBountyUsd: number
  username?: string | null
  avatar_url?: string | null
  wallet_addresses?: string[]
  twitter_username?: string | null
  discord_username?: string | null
}

export type TagSentinelStatus = 'active' | 'breached' | 'closed'

export interface TagSentinelEntry {
  agentId: string
  owner: string | null
  status: TagSentinelStatus
  launchedAt: string | null
}

export interface TagActivityEntry {
  kind: 'attack' | 'breach'
  agentId: string
  wallet: string
  success: boolean | null
  bountyWonUsd: number | null
  timestamp: string
}

interface ProjectionSummary<T> {
  available: boolean
  entries: T[]
  total: number
}

export interface TagPageResponse {
  tag: TagPageIdentity
  metadata: TagPageMetadata
  metricsAvailable: boolean
  lastComputedAt: string | null
  metrics: TagActivitySummary | null
  defenders: ProjectionSummary<TagDefenderEntry>
  attackers: ProjectionSummary<TagAttackerEntry>
  sentinels: ProjectionSummary<TagSentinelEntry>
  activity: ProjectionSummary<TagActivityEntry>
}

export interface TagDefendersResponse {
  defenders: TagDefenderEntry[]
  total: number
  limit: number
  offset: number
  sort: string
  available: boolean
  lastComputedAt: string | null
}

export interface TagAttackersResponse {
  attackers: TagAttackerEntry[]
  total: number
  limit: number
  offset: number
  sort: string
  available: boolean
  lastComputedAt: string | null
}

export interface TagSentinelsResponse {
  sentinels: TagSentinelEntry[]
  total: number
  limit: number
  offset: number
  status: string
  available: boolean
  lastComputedAt: string | null
}

/** Supported leaderboard sort fields (backend whitelist). */
export const TAG_DEFENDER_SORT_OPTIONS = [
  { value: 'composite_score', label: 'Activity score' },
  { value: 'sentinels_launched', label: 'Sentinels launched' },
  { value: 'attacks_survived', label: 'Attacks survived' },
  { value: 'active_sentinels', label: 'Active sentinels' },
  { value: 'breach_rate_pct', label: 'Breach rate' },
  { value: 'bounty_paid_usd', label: 'Bounty paid' },
] as const

export const TAG_ATTACKER_SORT_OPTIONS = [
  { value: 'composite_score', label: 'Activity score' },
  { value: 'total_attacks', label: 'Attacks' },
  { value: 'successful_breaches', label: 'Breaches' },
  { value: 'breach_rate_pct', label: 'Breach rate' },
  { value: 'bounty_won_usd', label: 'Bounty won' },
] as const
