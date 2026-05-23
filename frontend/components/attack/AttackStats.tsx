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
  ]
}

const STAT_PLACEHOLDERS = ['tvl', 'bounties', 'attacks', 'breached', 'active']
const STAT_SERIALS = ['RS-358-V', 'RS-772-B', 'RS-912-L', 'RS-440-X', 'RS-001-A']

export function AttackStats() {
  const { data, isLoading } = usePlatformStats()
  const stats = data ? buildStats(data) : []

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {isLoading || !data
        ? STAT_PLACEHOLDERS.map((id, index) => (
            <div
              key={id}
              className="relative min-h-[118px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-4 md:p-5"
            >
              <span className="absolute right-2 top-2 font-mono text-[9px] text-[var(--color-text-faint)]">
                {STAT_SERIALS[index]}
              </span>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))
        : stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`relative min-h-[118px] border p-4 shadow-[var(--shadow-card)] transition-colors md:p-5 ${
                index === 0
                  ? 'tactical-glow border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-gold-primary)]'
              }`}
            >
              {index > 0 && (
                <span className="absolute right-2 top-2 font-mono text-[9px] text-[var(--color-text-faint)]">
                  {STAT_SERIALS[index]}
                </span>
              )}
              <p
                className={`font-display text-lg font-bold tabular-nums md:text-2xl ${
                  index === 0
                    ? 'text-[var(--color-text-on-gold)]'
                    : 'text-[var(--color-gold-light)]'
                }`}
              >
                {formatValue(stat.value, stat.format, stat.suffix)}
              </p>
              <p
                className={`mt-4 max-w-[10rem] font-mono text-[10px] font-medium uppercase tracking-[0.14em] md:text-xs ${
                  index === 0
                    ? 'text-[var(--color-gold-dark)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {stat.label}
              </p>
            </div>
          ))}
    </div>
  )
}
