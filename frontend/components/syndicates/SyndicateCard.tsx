'use client'

import Link from 'next/link'
import { Lock, Unlock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type SyndicateListItem } from '@/hooks/syndicate/useSyndicatesList'
import { ICON_MAP, iconForAddress } from './syndicateIcons'
import { IdlePrincipalStat } from './IdlePrincipalStat'

interface SyndicateCardProps {
  syndicate: SyndicateListItem
  isUserSyndicate: boolean
}

export function SyndicateCard({ syndicate, isUserSyndicate }: SyndicateCardProps) {
  const Icon = ICON_MAP[iconForAddress(syndicate.contract_address)]
  const address = syndicate.contract_address as `0x${string}`

  const sentinelLabel = syndicate.agent_id
    ? `${syndicate.agent_id.slice(0, 6)}...${syndicate.agent_id.slice(-4)}`
    : 'None'

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--color-gold-primary)] hover:shadow-[0_0_15px_rgba(200,56,79,0.15)]',
        isUserSyndicate && 'shadow-[inset_0_0_20px_rgba(200,56,79,0.05)]'
      )}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold-primary)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-6 flex items-start justify-between">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-lg border',
            isUserSyndicate
              ? 'border-[var(--color-gold-primary)]/40 bg-[var(--color-gold-muted)]'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-subtle)]'
          )}
        >
          <Icon
            className={cn(
              'h-7 w-7',
              isUserSyndicate ? 'text-[var(--color-gold-primary)]' : 'text-[var(--color-text-muted)]'
            )}
            strokeWidth={isUserSyndicate ? 2.5 : 2}
          />
        </div>
        {isUserSyndicate && (
          <span className="rounded-sm bg-[var(--color-gold-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Your Syndicate
          </span>
        )}
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
            Access
          </div>
          <div className="mt-0.5 flex items-center gap-1 font-mono text-sm">
            {syndicate.whitelist_enabled ? (
              <>
                <Lock className="h-3 w-3 text-yellow-500" />
                <span className="text-yellow-500">Permissioned</span>
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 text-green-400" />
                <span className="text-green-400">Public</span>
              </>
            )}
          </div>
        </div>
        <div className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Idle Principal
          </div>
          <IdlePrincipalStat address={address} tokenSymbol={syndicate.token_symbol} />
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
