'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'

import {
  ARENA_FEED_ROTATE_MS,
  ARENA_FEED_VISIBLE_ROWS,
  timeAgo,
  useArenaActivity,
  type ArenaEvent,
} from '@/hooks/arena/useArenaActivity'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ARENA_CYAN, ARENA_PURPLE } from '@/components/attack/ArenaHowItWorks'

/** Verb chip per event kind — the feed's color semantics match the rest of
 * the landing page: cyan = deploy, purple = break, red = failure, gold = money. */
function VerbChip({ kind }: { kind: ArenaEvent['kind'] }) {
  if (kind === 'attack_broke') {
    return (
      <span
        className="shrink-0 border px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{ color: ARENA_PURPLE, borderColor: `${ARENA_PURPLE}59`, backgroundColor: `${ARENA_PURPLE}14` }}
      >
        Broke
      </span>
    )
  }
  if (kind === 'deployed') {
    return (
      <span
        className="shrink-0 border px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{ color: ARENA_CYAN, borderColor: `${ARENA_CYAN}59`, backgroundColor: `${ARENA_CYAN}14` }}
      >
        Deployed
      </span>
    )
  }
  return (
    <span className="shrink-0 border border-[var(--color-border-default)] px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
      Attacked
    </span>
  )
}

function FeedRow({ event, now }: { event: ArenaEvent; now: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid h-[42px] grid-cols-[3.5rem_1fr_auto] items-center gap-x-3 border-b border-[var(--color-border-default)] px-4 last:border-b-0 md:h-11 md:px-5"
    >
      <span className="whitespace-nowrap font-mono text-[10px] tabular-nums tracking-wide text-[var(--color-text-muted)]">
        {timeAgo(event.timestamp, now)}
      </span>
      {/* Single line, no wrap — fixed row heights keep the panel (and
          everything below it) from shifting as events rotate in. */}
      <p className="flex min-w-0 items-center gap-x-2 overflow-hidden font-mono text-[11px] tracking-normal text-[var(--color-text-secondary)]">
        <span className="shrink-0 text-white">{event.actor}</span>
        <VerbChip kind={event.kind} />
        <span className="truncate font-semibold text-white">{event.targetName}</span>
        {event.kind === 'attack_failed' && (
          <>
            <span className="shrink-0 font-bold text-[var(--color-danger)]">FAILED</span>
            {typeof event.severity === 'number' && (
              <span className="hidden shrink-0 text-[var(--color-text-muted)] sm:inline">
                sev {event.severity}/10
              </span>
            )}
          </>
        )}
      </p>
      {event.amount && (
        <span className="shrink-0 whitespace-nowrap font-mono text-[11px] font-bold tabular-nums text-[var(--color-accent)]">
          {event.amount}
        </span>
      )}
    </motion.div>
  )
}

/** Landing-page live feed — proof the arena is alive within five seconds.
 * Newest events slide in at the top (mempool/Facebook-ticker pattern); hover
 * pauses the rotation so rows can be read. Placeholder-driven until the
 * event-log endpoint lands (see useArenaActivity). */
export function LiveActivityFeed() {
  const { data: pool } = useArenaActivity()
  const [feed, setFeed] = useState<ArenaEvent[]>([])
  const [paused, setPaused] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [mounted, setMounted] = useState(false)
  const cursor = useRef(ARENA_FEED_VISIBLE_ROWS)
  const rotation = useRef(0)

  useEffect(() => setMounted(true), [])

  // Seed the visible window once — never re-seed on refetch, or the whole
  // window (and its ages) jumps every time react-query refreshes the pool.
  useEffect(() => {
    setFeed(prev => (prev.length === 0 && pool ? pool.slice(0, ARENA_FEED_VISIBLE_ROWS) : prev))
  }, [pool])

  // Keep "5m ago" honest between arrivals.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Rotate: recycle a pooled event to the top with a fresh timestamp so the
  // feed keeps moving even at low volume. TODO(backend): replace with real
  // polling/websocket arrivals.
  useEffect(() => {
    if (paused || !pool || pool.length === 0) return
    const id = setInterval(() => {
      setFeed(prev => {
        if (prev.length === 0) return prev
        const next: ArenaEvent = {
          ...pool[cursor.current % pool.length],
          timestamp: Date.now(),
          id: `rot-${rotation.current++}`,
        }
        cursor.current += 1
        return [next, ...prev].slice(0, ARENA_FEED_VISIBLE_ROWS)
      })
    }, ARENA_FEED_ROTATE_MS)
    return () => clearInterval(id)
  }, [paused, pool])

  const showSkeleton = !mounted || !pool

  return (
    <MotionConfig reducedMotion="user">
      <section className="mb-10 md:mb-20">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
              The Arena, Right Now
            </h2>
            <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
              Real attacks. Real verdicts. Real money moving.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 border border-[var(--color-border-default)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-success)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--color-success)]" />
            </span>
            Live
          </span>
        </div>

        <div
          className="relative border border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Explicit height = 8 fixed rows. Anything that briefly overflows
              (exit animations, refetch swaps) clips here instead of resizing
              the page below. */}
          <div className="relative h-[336px] overflow-hidden md:h-[352px]">
            {showSkeleton
              ? Array.from({ length: ARENA_FEED_VISIBLE_ROWS }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-[42px] items-center gap-4 border-b border-[var(--color-border-default)] px-4 last:border-b-0 md:h-11 md:px-5"
                  >
                    <Skeleton className="h-3 w-10 shrink-0 bg-white/10" />
                    <Skeleton className={cn('h-3 bg-white/10', i % 3 === 0 ? 'w-3/5' : 'w-2/5')} />
                    <Skeleton className="ml-auto h-3 w-14 shrink-0 bg-white/10" />
                  </div>
                ))
              : null}
            {!showSkeleton && (
              <AnimatePresence initial={false} mode="popLayout">
                {feed.map(event => (
                  <FeedRow key={event.id} event={event} now={now} />
                ))}
              </AnimatePresence>
            )}
            {/* Fade suggests the ledger continues past the window. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[var(--color-bg-base)]"
            />
          </div>
        </div>
      </section>
    </MotionConfig>
  )
}
