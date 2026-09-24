'use client'

import Link from 'next/link'
import { Info } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useSyndicatesList } from '@/hooks/syndicate/useSyndicatesList'
import { StatBadge } from './StatBadge'
import { SyndicateCard } from './SyndicateCard'
import { SyndicateCardSkeleton } from './SyndicateCardSkeleton'
import { ForgeCard } from './ForgeCard'

export function SyndicateDirectory() {
  const { address: connectedAddress } = useAccount()
  const { data, isLoading, isError } = useSyndicatesList()

  const syndicates = data?.syndicates ?? []
  const total = data?.total ?? null

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--color-gold-primary)] blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-[var(--secondary_pink)] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border-default)] pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-4xl font-bold leading-[56px] tracking-tight text-[var(--color-text-primary)] md:text-5xl">
              Syndicates
            </h1>
            <p className="max-w-2xl text-base leading-6 text-[var(--color-text-secondary)]">
              One defender seeds a pool. A syndicate builds a fortress. Pool your funds, launch
              bigger sentinels, split the attack fees by contribution.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatBadge
              label="Active Syndicates"
              value={total !== null ? total.toLocaleString() : null}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <SyndicateCardSkeleton key={i} />)}

          {isError && (
            <div className="col-span-full flex items-center justify-center py-20 text-sm text-[var(--color-text-muted)]">
              Failed to load syndicates. Please try again.
            </div>
          )}

          {!isLoading &&
            !isError &&
            syndicates.map(syndicate => (
              <SyndicateCard
                key={syndicate.contract_address}
                syndicate={syndicate}
                isUserSyndicate={
                  !!connectedAddress &&
                  syndicate.owner.toLowerCase() === connectedAddress.toLowerCase()
                }
              />
            ))}

          {!isLoading && <ForgeCard />}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 lg:flex-row">
          <div className="flex items-center gap-4">
            <div className="rounded bg-[var(--color-gold-muted)] p-3">
              <Info className="h-5 w-5 text-[var(--color-gold-primary)]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                New to Syndicates?
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Learn how collectives operate and govern shared resources.
              </p>
            </div>
          </div>
          <Link
            href="/defend?mode=syndicate"
            className="rounded bg-[var(--color-gold-primary)] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-on-gold)] transition-opacity hover:opacity-90"
          >
            Create Syndicate
          </Link>
        </div>
      </div>
    </div>
  )
}
