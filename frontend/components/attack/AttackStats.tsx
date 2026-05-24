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
    <div className="grid grid-cols-1 overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-border-default)] sm:grid-cols-2 lg:grid-cols-5">
      {isLoading || !data
        ? STAT_PLACEHOLDERS.map((id, index) => (
            <div key={id} className="relative min-h-[126px] bg-black p-6 md:p-8">
              <Skeleton className="h-8 w-28 bg-white/10" />
              <Skeleton className="mt-5 h-3 w-32 bg-white/10" />
            </div>
          ))
        : stats.map((stat, index) => (
            <div
              key={stat.id}
              className="relative min-h-[126px] bg-black p-6 transition-colors hover:bg-white/[0.03] md:p-8"
            >
              <p className="font-display text-2xl font-extrabold uppercase tabular-nums tracking-[0.04em] text-white md:text-3xl">
                {formatValue(stat.value, stat.format, stat.suffix)}
              </p>
              <p className="font-body mt-5 max-w-[10rem] text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] md:text-[11px]">
                {stat.label}
              </p>
            </div>
          ))}
    </div>
  )
}
