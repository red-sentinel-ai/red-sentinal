'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn, formatTokenAmount } from '@/lib/utils'
import { getDecimalsForSymbol } from '@/lib/syndicate-utils'
import { type SyndicateListItem } from '@/hooks/syndicate/useSyndicatesList'
import { SyndicateStatusBadge } from './SyndicateStatusBadge'
import { SyndicateVisibilityBadge } from './SyndicateVisibilityBadge'

interface SyndicateCardProps {
  syndicate: SyndicateListItem
  isUserSyndicate: boolean
}

export function SyndicateCard({ syndicate, isUserSyndicate }: SyndicateCardProps) {
  const address = syndicate.contract_address as `0x${string}`

  const sentinelLabel = syndicate.agent_id
    ? `${syndicate.agent_id.slice(0, 6)}...${syndicate.agent_id.slice(-4)}`
    : 'None'

  const decimals = getDecimalsForSymbol(syndicate.token_symbol)
  const totalManagedAsset = `${formatTokenAmount(syndicate.total_funds, decimals)} ${syndicate.token_symbol}`

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--color-gold-primary)] hover:shadow-[0_0_15px_rgba(200,56,79,0.15)]',
        isUserSyndicate && 'shadow-[inset_0_0_20px_rgba(200,56,79,0.05)]'
      )}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold-primary)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SyndicateStatusBadge status={syndicate.status} />
          {isUserSyndicate && (
            <span className="rounded-sm bg-[var(--color-gold-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-on-gold)]">
              Your Syndicate
            </span>
          )}
        </div>
        <SyndicateVisibilityBadge whitelistEnabled={syndicate.whitelist_enabled} />
      </div>

      <h3 className="mb-2 text-xl font-semibold leading-8 tracking-tight text-[var(--color-text-primary)]">
        {syndicate.name}
      </h3>
      <p className="mb-6 line-clamp-2 text-base leading-6 text-[var(--color-text-secondary)]">
        {syndicate.description || 'No description provided.'}
      </p>

      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Members
          </div>
          <div className="mt-0.5 font-mono text-sm text-[var(--color-text-primary)]">
            {syndicate.members_count.toLocaleString()}
          </div>
        </div>
        <div className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Total Managed Asset
          </div>
          <div className="mt-0.5 truncate font-mono text-sm text-[var(--color-text-primary)]">
            {totalManagedAsset}
          </div>
        </div>
      </div>

      <div className="mb-6 mt-6 flex items-center justify-between text-[var(--color-text-secondary)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider">Primary Sentinel</span>
        <span
          className={cn(
            'font-mono text-sm',
            isUserSyndicate
              ? 'text-[var(--color-gold-primary)]'
              : 'text-[var(--color-text-primary)]',
            !syndicate.agent_id && 'text-[var(--color-text-muted)]'
          )}
        >
          {sentinelLabel}
        </span>
      </div>

      {isUserSyndicate ? (
        <Link
          href={`/syndicate/${address}`}
          className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-[var(--color-text-primary)]"
        >
          View Syndicate
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <Link
          href={`/syndicate/${address}`}
          className="block w-full rounded border border-[var(--color-gold-primary)] py-2.5 text-center text-sm font-semibold uppercase tracking-wider text-[var(--color-gold-primary)] transition-colors hover:bg-[var(--color-gold-primary)]/10"
        >
          View Syndicate
        </Link>
      )}
    </div>
  )
}
