'use client'

import Link from 'next/link'
import { Gauge, Target } from 'lucide-react'

import type { PracticeSentinel } from '@/types/practice'

export function PracticeSentinelCard({ sentinel }: { sentinel: PracticeSentinel }) {
  const name = sentinel.name || `Sentinel ${sentinel.sentinel_id}`

  return (
    <Link
      href={`/practice/${sentinel.sentinel_id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)] transition-colors hover:border-white/45"
    >
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden bg-[var(--color-bg-subtle)]">
        <span className="font-display text-5xl font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="font-body absolute left-4 top-4 inline-flex items-center bg-white px-3 py-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.1em] text-black">
          {sentinel.sentinel_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start gap-2">
          <h3 className="font-display min-w-0 flex-1 truncate text-lg font-extrabold uppercase tracking-[0.04em] text-white">
            {name}
          </h3>
          <span className="font-body mt-1 inline-flex shrink-0 items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            <Gauge className="h-3 w-3" />
            Lvl {sentinel.difficulty_level}
          </span>
        </div>

        <div className="mb-8 min-w-0">
          <p className="font-body mb-1 flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            <Target className="h-2.5 w-2.5" />
            Attack Goal
          </p>
          <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {sentinel.attack_goal || 'Break the sentinel’s defenses.'}
          </p>
        </div>

        <div className="font-body mt-auto flex h-11 w-full items-center justify-center rounded-full border border-white text-[11px] font-extrabold uppercase tracking-[0.1em] text-white transition-all group-hover:bg-white group-hover:text-black group-active:scale-[0.98]">
          Practice Attack
        </div>
      </div>
    </Link>
  )
}
