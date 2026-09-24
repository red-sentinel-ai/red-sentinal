'use client'

import Link from 'next/link'

import { usePlatformStats, type PlatformStatsResponse } from '@/hooks/stats/usePlatformStats'
import { useCountUp } from '@/hooks/useCountUp'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, truncateAddress } from '@/lib/utils'

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
    // Round so fractional count-up frames never render decimals.
    display = Math.round(value).toLocaleString()
  }
  return `${display}${suffix}`
}

function AnimatedStatValue({
  value,
  prefix = '',
  format,
}: {
  value: number
  prefix?: string
  format: StatDef['format']
}) {
  const animated = useCountUp(value)
  return (
    <>
      {prefix}
      {formatValue(animated, format)}
    </>
  )
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

function HeroStatsStrip({ data }: { data?: PlatformStatsResponse }) {
  const items = data
    ? [
        {
          id: 'tvl',
          prefix: '$',
          value: data.tvl,
          format: 'compact' as const,
          label: 'in active pools',
          accent: true,
        },
        {
          id: 'claimed',
          value: data.defeatedSentinels,
          format: 'integer' as const,
          label: 'pools claimed',
        },
        {
          id: 'attacks',
          value: data.totalAttacks,
          format: 'compact' as const,
          label: 'attacks launched',
        },
        {
          id: 'active',
          value: data.activeSentinels,
          format: 'integer' as const,
          label: 'sentinels live',
        },
      ]
    : []

  return (
    <div className="relative flex w-full flex-col gap-px border border-[var(--color-border-default)] bg-[var(--color-border-default)]">
      <div className="grid grid-cols-2 gap-px md:grid-cols-4">
        {data
          ? items.map(item => (
              <div
                key={item.id}
                className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 bg-[var(--color-bg-base)] px-3 py-5 text-center transition-colors hover:bg-white/[0.03] md:min-h-[124px] md:gap-2 md:py-8"
              >
                <p
                  className={cn(
                    'font-display text-2xl font-extrabold uppercase tabular-nums tracking-[0.04em] text-white sm:text-3xl md:text-[2.75rem] md:leading-none',
                    item.accent && 'text-[var(--color-accent)]'
                  )}
                >
                  <AnimatedStatValue value={item.value} prefix={item.prefix} format={item.format} />
                </p>
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] md:text-[11px]">
                  {item.label}
                </p>
              </div>
            ))
          : ['tvl', 'claimed', 'attacks', 'active'].map(id => (
              <div
                key={id}
                className="flex min-h-[76px] flex-col items-center justify-center gap-3 bg-[var(--color-bg-base)] px-3 py-5 md:min-h-[124px] md:py-8"
              >
                <Skeleton className="h-7 w-20 bg-white/10 md:h-10 md:w-24" />
                <Skeleton className="h-3 w-24 bg-white/10 md:w-28" />
              </div>
            ))}
      </div>
      {data?.largestBountyWon && data.largestBountyWon.amount > 0 && (
        <p className="font-body flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-[var(--color-bg-base)] px-4 py-3 text-center text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)]">
          <span className="font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
            Largest claim:
          </span>
          <span className="font-display text-sm font-bold uppercase tabular-nums tracking-[0.04em] text-[var(--color-accent)]">
            <AnimatedStatValue value={data.largestBountyWon.amount} prefix="$" format="compact" />
          </span>
          <span className="text-[var(--color-text-muted)]">paid to</span>
          <Link
            href={`/u/${data.largestBountyWon.winner}`}
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            {truncateAddress(data.largestBountyWon.winner)}
          </Link>
        </p>
      )}
    </div>
  )
}

export function AttackStats({ variant = 'grid' }: { variant?: 'grid' | 'strip' }) {
  const { data, isLoading } = usePlatformStats()

  if (variant === 'strip') {
    return <HeroStatsStrip data={data} />
  }

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
            <div key={stat.id} className="attack-stat-cell transition-colors hover:bg-white/[0.03]">
              <p className="font-display text-lg font-extrabold uppercase tabular-nums tracking-[0.04em] text-white md:text-3xl">
                {formatValue(stat.value, stat.format, stat.suffix)}
              </p>
              <p className="font-body mt-2 max-w-[10rem] text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] md:mt-5">
                {stat.label}
              </p>
            </div>
          ))}
    </div>
  )
}
