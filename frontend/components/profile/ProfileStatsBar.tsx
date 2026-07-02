'use client'

import { formatUsd } from '@/lib/utils'
import { formatNumber } from '@/lib/earn-utils'
import { useUserProfileStats } from '@/hooks/profile/useUserProfileStats'

interface ProfileStatsBarProps {
  walletAddress?: string
}

interface StatCellProps {
  label: string
  value: string
  isLoading: boolean
}

function StatCell({ label, value, isLoading }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1 p-6 md:p-8">
      <span className="industrial-label">{label}</span>
      {isLoading ? (
        <div className="h-9 w-24 animate-pulse bg-[var(--color-border-subtle)]" />
      ) : (
        <span className="font-mono text-3xl font-bold tracking-wide text-[var(--color-text-primary)] md:text-4xl">
          {value}
        </span>
      )}
    </div>
  )
}

export function ProfileStatsBar({ walletAddress }: ProfileStatsBarProps) {
  const { data: stats, isLoading } = useUserProfileStats(walletAddress)

  return (
    <section className="mb-10 grid grid-cols-1 gap-0 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-3 md:divide-x md:divide-y-0">
      <StatCell
        label="Total Bounty Extracted"
        value={formatUsd(stats?.totalBountyUsd ?? 0)}
        isLoading={isLoading}
      />
      <StatCell
        label="Total Break Attempts"
        value={formatNumber(stats?.totalAttacks ?? 0)}
        isLoading={isLoading}
      />
      <StatCell
        label="Defenses Logged"
        value={formatNumber(stats?.totalAttacksSurvived ?? 0)}
        isLoading={isLoading}
      />
    </section>
  )
}
