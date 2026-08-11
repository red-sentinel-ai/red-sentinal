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
    { id: 'tvl', label: 'Available Bounties', value: data.tvl, suffix: ' USD', format: 'compact' },
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
  ]
}

const STAT_PLACEHOLDERS = ['tvl', 'bounties', 'attacks', 'breached', 'active']

export function AttackStats() {
  const { data, isLoading } = usePlatformStats()
  const stats = data ? buildStats(data) : []

  return (
    <div className="grid grid-cols-2 overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-border-default)] lg:grid-cols-5">
      {isLoading || !data
        ? STAT_PLACEHOLDERS.map(id => (
            <div key={id} className="attack-stat-cell">
              <Skeleton className="h-6 w-20 bg-white/10 md:h-8 md:w-28" />
              <Skeleton className="mt-2 h-3 w-20 bg-white/10 md:mt-5 md:w-32" />
            </div>
          ))
        : stats.map(stat => (
            <div
              key={stat.id}
              className="attack-stat-cell transition-colors hover:bg-white/[0.03]"
            >
              <p className="font-display text-lg font-extrabold uppercase tabular-nums tracking-[0.04em] text-white md:text-3xl">
                {formatValue(stat.value, stat.format, stat.suffix)}
              </p>
              <p className="font-body mt-2 max-w-[10rem] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] md:mt-5 md:text-[11px]">
                {stat.label}
              </p>
            </div>
          ))}
    </div>
  )
}
