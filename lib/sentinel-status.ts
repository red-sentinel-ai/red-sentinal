import type { Agent } from '@/types/agents'

export type SentinelStatus = 'active' | 'paused' | 'defeated'

export type SentinelStatusFilter = SentinelStatus | 'all'

export function getSentinelStatus(
  agent: Pick<Agent, 'state' | 'unlock_timestamp'>
): SentinelStatus {
  if (agent.state === 'defeated') return 'defeated'

  const unlockTimestamp = Number(agent.unlock_timestamp)
  const isAttackPaused = unlockTimestamp > 0 && unlockTimestamp <= Date.now()
  if (isAttackPaused) return 'paused'

  return 'active'
}

export function isSentinelAttackable(
  agent: Pick<Agent, 'state' | 'unlock_timestamp'>
): boolean {
  return getSentinelStatus(agent) === 'active'
}

export interface SentinelStatusMeta {
  label: string
  dotLabel: string
  dotClassName: string
  badgeClassName: string
  accentClassName: string
  actionLabel: string
  actionClassName: string
}

export const SENTINEL_STATUS_META: Record<SentinelStatus, SentinelStatusMeta> = {
  active: {
    label: 'Active',
    dotLabel: 'Active Breaches',
    dotClassName: 'animate-pulse bg-white',
    badgeClassName: 'border-white/40 text-white',
    accentClassName: 'text-white',
    actionLabel: 'Attack',
    actionClassName: 'sentinel-action-attack'
  },
  paused: {
    label: 'Locked',
    dotLabel: 'Attacks Paused',
    dotClassName: 'bg-[var(--color-warning)]',
    badgeClassName: 'border-[var(--color-warning)]/40 text-[var(--color-warning)]',
    accentClassName: 'text-[var(--color-warning)]',
    actionLabel: 'View',
    actionClassName: 'sentinel-action-view'
  },
  defeated: {
    label: 'Defeated',
    dotLabel: 'Defeated',
    dotClassName: 'bg-[var(--color-danger)]',
    badgeClassName: 'border-[var(--color-danger)]/40 text-[var(--color-danger)]',
    accentClassName: 'text-[var(--color-danger)]',
    actionLabel: 'View',
    actionClassName: 'sentinel-action-view'
  }
}

const SENTINEL_STATUSES = Object.keys(SENTINEL_STATUS_META) as SentinelStatus[]

export const SENTINEL_STATUS_FILTER_OPTIONS: { value: SentinelStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  ...SENTINEL_STATUSES.map(status => ({ value: status, label: SENTINEL_STATUS_META[status].label }))
]
