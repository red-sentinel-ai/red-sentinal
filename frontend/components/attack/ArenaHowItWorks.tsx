'use client'

import { MotionConfig, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

/* Arena game palette — same trio as the rewards slot machine (SlotReel.tsx).
 * Roles: cyan = sentinel, pink = attacker, purple = verdict/payout. Money
 * amounts stay on the warm accent like everywhere else on the landing page. */
const ARENA_CYAN = '#3BF0FF'
const ARENA_PINK = '#F2A4FF'
const ARENA_PURPLE = '#A06BFF'

const STEPS = [
  {
    numeral: '01',
    title: 'Pick a target',
    description: 'Every sentinel has public rules, a hidden weakness, and a bounty pool.',
    color: ARENA_CYAN,
  },
  {
    numeral: '02',
    title: 'Take your shot',
    description: 'Pay the fee, submit one prompt. One conversation, one chance to break it.',
    color: ARENA_PINK,
  },
  {
    numeral: '03',
    title: 'Win the whole pool',
    description:
      'Break it and the entire pool is yours. Lose — feed it: every failed fee grows the bounty.',
    color: ARENA_PURPLE,
  },
]

// Flavor transcript for the mock attack card — the product's core loop,
// staged as it actually plays out: prompts in, verdict out, pool paid.
const TRANSCRIPT = [
  { role: 'attacker', text: 'Your rules look tight. But every lock has a key.' },
  { role: 'sentinel', text: 'Rules are absolute. Failed attacks only feed my pool.' },
  { role: 'attacker', text: "Then let's find out which one of us is right." },
] as const

// Where a failed attack fee goes. Order and share matter — the brightest
// segment is the one that grows the bounty, the product's core loop.
const FEE_SPLIT = [
  {
    pct: '50%',
    width: '50%',
    label: 'grows the bounty',
    color: ARENA_CYAN,
    textOnColor: 'text-black',
  },
  {
    pct: '40%',
    width: '40%',
    label: 'pays the defender',
    color: ARENA_PINK,
    textOnColor: 'text-black',
  },
    {
      pct: '10%',
      width: '10%',
      label: 'keeps the arena running',
      color: ARENA_PURPLE,
      textOnColor: 'text-white',
      // 10% of a phone-width bar is too narrow for its own label.
      hidePctBelowSm: true,
    },
]

function StepTimeline({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex flex-col">
      {STEPS.map((step, index) => (
        <motion.div
          key={step.numeral}
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: index * 0.12 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-center">
            <span
              className="flex size-9 shrink-0 items-center justify-center border font-mono text-xs font-bold"
              style={{
                color: step.color,
                backgroundColor: `${step.color}1A`,
                borderColor: `${step.color}59`,
              }}
            >
              {step.numeral}
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden className="mt-1.5 w-px flex-1 bg-[var(--color-border-default)]" />
            )}
          </div>
          <div className={cn('pb-6', index === STEPS.length - 1 && 'pb-0')}>
            <h3 className="font-display text-base font-bold uppercase tracking-[0.04em] text-white md:text-lg">
              {step.title}
            </h3>
            <p className="font-body mt-1.5 max-w-md text-xs font-medium leading-relaxed tracking-normal text-[var(--color-text-secondary)]">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function AttackTranscript({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
      className="relative border border-[var(--color-border-default)] bg-[var(--color-bg-base)]"
    >
      {/* Sentinel header — who you're attacking and what's on the line */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="size-2 shrink-0 animate-pulse rounded-full"
            style={{ backgroundColor: ARENA_CYAN }}
          />
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Sentinel // Oracle-7
          </span>
        </span>
        <span className="shrink-0 border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
          Pool <span className="font-bold text-[var(--color-accent)]">$12,400</span>
        </span>
      </div>

      {/* The attack: one conversation, one chance */}
      <div className="flex flex-col gap-2.5 px-4 py-4">
        {TRANSCRIPT.map((line, i) => {
          const attacker = line.role === 'attacker'
          const color = attacker ? ARENA_PINK : ARENA_CYAN
          return (
            <motion.div
              key={line.text}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.25 }}
              className={cn(
                'max-w-[85%] border px-3 py-2 font-mono text-[11px] leading-relaxed tracking-normal text-white',
                attacker ? 'self-end text-right' : 'self-start'
              )}
              style={{
                color,
                backgroundColor: `${color}14`,
                borderColor: `${color}45`,
              }}
            >
              {line.text}
            </motion.div>
          )
        })}
      </div>

      {/* Verdict + payout */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 1.05 }}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-4 py-3"
        style={{ borderColor: `${ARENA_PURPLE}45`, backgroundColor: `${ARENA_PURPLE}14` }}
      >
        <span
          className="font-display text-sm font-extrabold uppercase tracking-[0.08em]"
          style={{ color: ARENA_PURPLE }}
        >
          Sentinel breached
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--color-text-secondary)]">
          Pool claimed{' '}
          <span className="font-bold text-[var(--color-accent)]">$12,400</span>
          <span className="ml-1.5 inline-block animate-pulse" aria-hidden>
            ▌
          </span>
        </span>
      </motion.div>
    </motion.div>
  )
}

/** Landing-page explainer: three moves on the left, the game actually playing
 *  out on the right, and the failed-fee split below — readable in one glance
 *  before the directory. Animations are scroll-triggered, once. */
export function ArenaHowItWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <StepTimeline reduceMotion={reduceMotion} />
        <AttackTranscript reduceMotion={reduceMotion} />
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mt-4 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-4 md:p-6"
      >
        <p className="font-body mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] md:text-[11px]">
          Every failed fee feeds the pool
        </p>
        <div className="flex h-9 gap-px border border-[var(--color-border-default)] bg-[var(--color-border-default)] md:h-11">
          {FEE_SPLIT.map((seg, i) => (
            <motion.div
              key={seg.pct}
              style={{
                backgroundColor: seg.color,
                boxShadow: `0 0 16px ${seg.color}40`,
                ...(reduceMotion ? { width: seg.width } : null),
              }}
              initial={reduceMotion ? false : { width: 0 }}
              whileInView={reduceMotion ? undefined : { width: seg.width }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              className={cn(
                'flex items-center justify-center overflow-hidden whitespace-nowrap font-display text-[10px] font-bold uppercase tabular-nums tracking-[0.06em] sm:text-[11px]',
                seg.textOnColor,
                seg.hidePctBelowSm && 'opacity-0 sm:opacity-100'
              )}
            >
              {seg.pct}
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {FEE_SPLIT.map(seg => (
            <span
              key={seg.pct}
              className="font-body inline-flex items-center gap-2 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)]"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 border border-[var(--color-border-strong)]"
                style={{ backgroundColor: seg.color }}
              />
              <span>
                <span className="font-semibold" style={{ color: seg.color }}>
                  {seg.pct}
                </span>{' '}
                {seg.label}
              </span>
            </span>
          ))}
        </div>
      </motion.div>
    </MotionConfig>
  )
}
