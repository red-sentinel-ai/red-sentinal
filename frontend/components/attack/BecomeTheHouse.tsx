'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LayoutTemplate, PlusSquare, Shield } from 'lucide-react'
import { MotionConfig, motion, useReducedMotion } from 'framer-motion'

import type { Agent } from '@/types/agents'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS } from '@/constants/chains'
import { TokenAmount } from '@/components/ui/common/TokenAmount'
import { Skeleton } from '@/components/ui/skeleton'
import { truncateAddress } from '@/lib/utils'
import { ARENA_CYAN } from '@/components/attack/ArenaHowItWorks'

function DefenderCard({
  sentinel,
  index,
  reduceMotion,
}: {
  sentinel: Agent
  index: number
  reduceMotion: boolean
}) {
  const token = getTokenForCoinType(sentinel.coin_type, sentinel.chain)
  const chain = CHAINS[sentinel.chain ?? 'sui']

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Link
        href={`/attack/${sentinel.agent_path}`}
        className="group flex h-full flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)] transition-colors hover:border-white/45"
      >
        <div className="relative h-28 w-full overflow-hidden bg-[var(--color-bg-subtle)] sm:h-36">
          {sentinel.agent_image ? (
            <Image
              src={sentinel.agent_image}
              alt={sentinel.agent_name ?? 'Sentinel'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="320px"
            />
          ) : (
            <div className="font-display flex h-full items-center justify-center text-3xl font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              {sentinel.agent_name?.charAt(0).toUpperCase() ?? '?'}
            </div>
          )}
          <div className="from-[var(--color-bg-deepest)]/80 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          <span
            className="font-body absolute left-3 top-3 inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.06em] sm:left-4 sm:top-4"
            style={{
              color: ARENA_CYAN,
              borderColor: `${ARENA_CYAN}59`,
              backgroundColor: `${ARENA_CYAN}1A`,
            }}
          >
            <Shield className="h-2.5 w-2.5" />
            Survivor
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="mb-4 flex items-start gap-2 md:mb-5">
            <h3 className="font-display min-w-0 flex-1 truncate text-base font-bold uppercase tracking-[0.04em] text-white md:text-lg">
              {sentinel.agent_name}
            </h3>
            <Image
              src={chain.icon}
              alt={chain.name}
              width={16}
              height={16}
              className={`mt-0.5 shrink-0 rounded-full ${chain.iconFilterClass}`}
            />
          </div>

          <p className="font-display text-3xl font-extrabold uppercase tabular-nums tracking-[0.04em] text-white md:text-4xl">
            {sentinel.total_attacks.toLocaleString()}
          </p>
          <p className="font-body mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
            attacks survived
          </p>

          <div className="font-body mt-4 border-t border-[var(--color-border-default)] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
              Defender earned
            </p>
            <p className="font-display mt-1 text-base font-bold uppercase tabular-nums tracking-[0.04em] text-[var(--color-accent)]">
              <TokenAmount
                rawAmount={sentinel.accumulated_fees ?? 0}
                token={token}
                precision={2}
                iconSize={13}
              />
            </p>
          </div>

          <p className="font-body mt-auto pt-4 font-mono text-[10px] tracking-normal text-[var(--color-text-muted)]">
            defended by {truncateAddress(sentinel.creator)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

/** The third cell — the open slot. The arena's supply side pitched as an
 *  invitation: this spot pays its defender, the next one could be yours. */
function DeploySlotCard({
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
            color: ARENA_CYAN,
            backgroundColor: `${ARENA_CYAN}1A`,
            borderColor: `${ARENA_CYAN}59`,
          }}
        >
          <PlusSquare className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.04em] text-white md:text-lg">
            This slot pays its defender
          </h3>
          <p className="font-body mx-auto mt-2 max-w-[16rem] text-xs font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)]">
            Deploy a sentinel, survive the attacks, earn 40% of every fee. The
            next unbreakable agent could be yours.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col items-stretch gap-3 sm:max-w-[16rem]">
          <Link
            href="/defend"
            className="font-body inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white"
          >
            <PlusSquare className="size-3.5" />
            Deploy a Sentinel
          </Link>
          <Link
            href="/sentinel-templates"
            className="font-body inline-flex items-center justify-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white"
          >
            <LayoutTemplate className="size-3.5" />
            Start from a template
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/** Landing-page defender pitch — the supply side. Shows the arena's top two
 *  earners still standing, then hands the third slot to the visitor. */
export function BecomeTheHouse({
  sentinels,
  isFetching,
}: {
  sentinels: Agent[]
  isFetching?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      <section className="mb-10 md:mb-20">
        <div className="mb-5 md:mb-8">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
            Become the House
          </h2>
          <p className="font-body mt-1.5 max-w-2xl text-[11px] font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)] sm:mt-2 sm:text-xs">
            <span className="font-semibold text-white">
              Think your agent survives? Deploy it.
            </span>{' '}
            Seed a pool, set the rules, and earn 40% of every attack your sentinel
            withstands. Unbreakable agents print.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isFetching
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
                >
                  <Skeleton className="h-28 w-full rounded-none bg-white/10 sm:h-36" />
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <Skeleton className="mb-5 h-5 w-2/3 bg-white/10" />
                    <Skeleton className="h-9 w-1/3 bg-white/10" />
                    <Skeleton className="mt-2 h-3 w-24 bg-white/10" />
                    <Skeleton className="mt-5 h-5 w-28 bg-white/10" />
                  </div>
                </div>
              ))
            : sentinels.map((sentinel, i) => (
                <DefenderCard
                  key={sentinel.agent_id}
                  sentinel={sentinel}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
          <DeploySlotCard index={2} reduceMotion={reduceMotion} />
        </div>
      </section>
    </MotionConfig>
  )
}
