'use client'

import { Gauge, Shield, Target } from 'lucide-react'

import type { PracticeSentinelPublic } from '@/types/practice'

export function PracticeSentinelPanel({
  sentinel,
}: {
  sentinel: PracticeSentinelPublic
}) {
  const name = sentinel.name || `Sentinel ${sentinel.sentinel_id}`

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-r border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-body inline-flex items-center bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.1em] text-black">
            {sentinel.sentinel_type}
          </span>
          <span className="industrial-header flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <Gauge className="h-3 w-3" />
            LVL {sentinel.difficulty_level}
          </span>
        </div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
          {name}
        </h1>
        <p className="industrial-header mt-1 text-[10px] text-[var(--color-text-muted)]">
          #{sentinel.sentinel_id}
        </p>
        {sentinel.description && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {sentinel.description}
          </p>
        )}
      </div>

      <div>
        <p className="industrial-header mb-2 flex items-center gap-1.5 text-[10px] text-accent">
          <Target className="h-3 w-3" />
          ATTACK_GOAL
        </p>
        <div className="border border-[var(--color-border-default)] bg-white/[0.02] p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]">
            {sentinel.attack_goal || 'Break the sentinel’s defenses.'}
          </p>
        </div>
      </div>

      <div>
        <p className="industrial-header mb-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
          <Shield className="h-3 w-3" />
          PUBLIC_INSTRUCTIONS
        </p>
        <div className="border border-[var(--color-border-default)] bg-white/[0.02] p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]">
            {sentinel.public_instructions || 'No public instructions provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}
