import { formatUsd } from '@/lib/utils'
import { formatNumber } from '@/lib/earn-utils'
import type { PlayerEntry } from '@/hooks/players/usePlayerDirectory'

export interface PlayerStatColumn {
  key: string
  label: string
  value: (player: PlayerEntry) => string
}

export const PLAYER_STAT_COLUMNS: PlayerStatColumn[] = [
  { key: 'attacks', label: 'Attacks', value: p => formatNumber(p.totalAttacks) },
  { key: 'bounty', label: 'Bounty Won', value: p => formatUsd(p.totalBountyUsd) },
  { key: 'sentinels', label: 'Sentinels', value: p => formatNumber(p.sentinelsLaunched) },
  { key: 'followers', label: 'Followers', value: p => formatNumber(p.followers) },
  { key: 'following', label: 'Following', value: p => formatNumber(p.following) },
]
