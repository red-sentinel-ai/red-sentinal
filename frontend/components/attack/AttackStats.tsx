'use client'

import { usePlatformStats, type PlatformStatsResponse } from '@/hooks/stats/usePlatformStats'
import { Skeleton } from '@/components/ui/skeleton'

type StatDef = {
  id: string
  label: string
  value: number
  suffix?: string
  format: 'compact' | 'integer'
}

function formatValue(value: number, format: StatDef['format'], suffix = '') {
  let display = ''
  if (format === 'compact') {
    if (value >= 1_000_000) display = (value / 1_000_000).toFixed(1) + 'M'
    else if (value >= 1_000) display = (value / 1_000).toFixed(1) + 'K'
    else display = value.toLocaleString()
  } else {
    display = value.toLocaleString()
  }
  return `${display}${suffix}`
}

function buildStats(data: PlatformStatsResponse): StatDef[] {
  return [
    { id: 'tvl', label: 'Value Secured', value: data.tvl, suffix: ' USD', format: 'compact' },
    {
      id: 'bounties',
      label: 'Bounties Claimed',
      value: data.totalBountyWon,
      suffix: ' USD',
      format: 'compact',
    },
    { id: 'attacks', label: 'Attacks Launched', value: data.totalAttacks, format: 'compact' },
    {
      id: 'breached',
      label: 'Sentinels Breached',
      value: data.defeatedSentinels,
      format: 'integer',
    },
    { id: 'active', label: 'Active Sentinels', value: data.activeSentinels, format: 'integer' },
    {
      id: 'token',
      label: '$SENTINEL Distributed',
      value: data.totalSentinelTokensDistributed,
      format: 'compact',
    },
  ]
}

const STAT_PLACEHOLDERS = ['tvl', 'bounties', 'attacks', 'breached', 'active', 'token']

export function AttackStats() {
  const { data, isLoading } = usePlatformStats()
  const stats = data ? buildStats(data) : []

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {isLoading || !data
        ? STAT_PLACEHOLDERS.map(id => (
            <div
              key={id}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 md:p-4"
            >
              <Skeleton className="h-6 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))
        : stats.map(stat => (
            <div
              key={stat.id}
              className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-border-default)] md:p-4"
            >
              <p className="font-display text-lg font-semibold tabular-nums text-[var(--color-text-primary)] md:text-2xl">
                {formatValue(stat.value, stat.format, stat.suffix)}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] md:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
    </div>
  )
}
