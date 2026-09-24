'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Users } from 'lucide-react'
import { MotionConfig, motion, useReducedMotion } from 'framer-motion'

import { useSyndicatesList, type SyndicateListItem } from '@/hooks/syndicate/useSyndicatesList'
import { formatTokenAmount } from '@/lib/utils'
import { getDecimalsForSymbol } from '@/lib/syndicate-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ARENA_PURPLE } from '@/components/attack/ArenaHowItWorks'

function SyndicateCard({
  syndicate,
  index,
  reduceMotion,
}: {
  syndicate: SyndicateListItem
  index: number
  reduceMotion: boolean
}) {
  const decimals = getDecimalsForSymbol(syndicate.token_symbol, syndicate.token_address)
  const tvl = `${formatTokenAmount(syndicate.total_funds, decimals)} ${syndicate.token_symbol}`
  const isActive = syndicate.status === 'active'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Link
        href={`/syndicate/${syndicate.contract_address}`}
        className="group flex h-full flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)] transition-colors hover:border-white/45"
      >
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-2 md:mb-5">
            <h3 className="font-display min-w-0 flex-1 truncate text-base font-bold uppercase tracking-[0.04em] text-white md:text-lg">
              {syndicate.name}
            </h3>
            <span
              className="font-body inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.06em]"
              style={{
                color: isActive ? '#4ADE80' : 'var(--color-text-muted)',
                borderColor: isActive ? '#4ADE8045' : 'var(--color-border-default)',
                backgroundColor: isActive ? '#4ADE801A' : 'transparent',
              }}
            >
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ backgroundColor: 'currentColor' }}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="font-display truncate text-3xl font-extrabold uppercase tabular-nums tracking-[0.04em] text-white md:text-4xl">
            {tvl}
          </p>
          <p className="font-body mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
            pooled capital
          </p>

          <div className="font-body mt-4 border-t border-[var(--color-border-default)] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
              Operators
            </p>
            <p className="font-display mt-1 text-base font-bold uppercase tabular-nums tracking-[0.04em] text-[var(--color-accent)]">
              {syndicate.members_count.toLocaleString()}{' '}
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                {syndicate.members_count === 1 ? 'member' : 'members'}
              </span>
            </p>
          </div>

          <p className="font-body mt-auto truncate pt-4 font-mono text-[10px] tracking-normal text-[var(--color-text-muted)]">
            {syndicate.agent_name
              ? `defending ${syndicate.agent_name}`
              : syndicate.whitelist_enabled
                ? 'permissioned · owner approval required'
                : 'open · anybody can join'}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

/** The third cell — the open slot. The collective supply side pitched as an
 *  invitation: pooled capital launches bigger bounties, bigger bounties draw
 *  better attackers, better attackers mean fatter fees. */
function ForgeSlotCard({
  index,
  reduceMotion,
}: {
  index: number
  reduceMotion: boolean
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-base)] p-5 text-center md:p-6">
        <span
          className="flex size-11 items-center justify-center border"
          style={{
            color: ARENA_PURPLE,
            backgroundColor: `${ARENA_PURPLE}1A`,
            borderColor: `${ARENA_PURPLE}59`,
          }}
        >
          <Users className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.04em] text-white md:text-lg">
            Pool together, win bigger
          </h3>
          <p className="font-body mx-auto mt-2 max-w-[16rem] text-xs font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)]">
            Bigger pools attract better attackers — better attackers mean fatter
            fees, split by contribution.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:max-w-[16rem]">
          <Link
            href="/syndicates"
            className="font-body inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white"
          >
            Explore Syndicates
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/defend?mode=syndicate"
            className="font-body inline-flex items-center justify-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white"
          >
            <Plus className="size-3.5" />
            Form a Syndicate
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/** Landing-page syndicate pitch — the collective supply side. Shows the two
 *  biggest pools live, then hands the third slot to the visitor. */
export function FormSyndicate() {
  const reduceMotion = useReducedMotion()
  const { data, isPending } = useSyndicatesList()

  const topSyndicates = useMemo(() => {
    const list = data?.syndicates ?? []
    return [...list]
      .sort((a, b) => {
        try {
          const diff = BigInt(b.total_funds) - BigInt(a.total_funds)
          if (diff > 0n) return 1
          if (diff < 0n) return -1
          return b.members_count - a.members_count
        } catch {
          return b.members_count - a.members_count
        }
      })
      .slice(0, 2)
  }, [data])

  return (
    <MotionConfig reducedMotion="user">
      <section className="mb-10 md:mb-20">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
              Syndicates
            </h2>
            <p className="font-body mt-1.5 max-w-2xl text-[11px] font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)] sm:mt-2 sm:text-xs">
              <span className="font-semibold text-white">
                Don&apos;t want to defend alone? Form a syndicate.
              </span>{' '}
              Pool capital with other operators, launch sentinels with serious
              bounties, and split the rake by contribution. Bigger pools attract
              better attackers — better attackers mean fatter fees.
            </p>
          </div>
          <Link
            href="/syndicates"
            className="font-body hidden shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white hover:underline sm:inline-flex"
          >
            Explore Syndicates <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isPending
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
                >
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <Skeleton className="mb-5 h-5 w-2/3 bg-white/10" />
                    <Skeleton className="h-9 w-1/3 bg-white/10" />
                    <Skeleton className="mt-2 h-3 w-24 bg-white/10" />
                    <Skeleton className="mt-5 h-5 w-28 bg-white/10" />
                  </div>
                </div>
              ))
            : topSyndicates.map((syndicate, i) => (
                <SyndicateCard
                  key={syndicate.contract_address}
                  syndicate={syndicate}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
          <ForgeSlotCard index={2} reduceMotion={reduceMotion} />
        </div>
      </section>
    </MotionConfig>
  )
}
