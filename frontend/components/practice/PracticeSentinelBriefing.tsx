'use client'

import { Shield, Target } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { PracticeSentinelPublic } from '@/types/practice'
import { PracticeSentinelSpecTile } from './PracticeSentinelSpecTile'

export function PracticeSentinelBriefing({ sentinel }: { sentinel: PracticeSentinelPublic }) {
  const sentinelName = sentinel.name || `Sentinel ${sentinel.sentinel_id}`
  const modelSpecs = [
    { label: 'MODEL', value: sentinel.model_name },
    { label: 'PROVIDER', value: sentinel.model_provider },
  ].filter(spec => Boolean(spec.value))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-body inline-flex items-center bg-white px-2.5 py-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.1em] text-black">
            {sentinel.sentinel_type}
          </span>
        </div>
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
          {sentinelName}
        </h2>
        <p className="industrial-header mt-1 text-[10px] text-[var(--color-text-muted)]">
          #{sentinel.sentinel_id}
        </p>
        {sentinel.description && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {sentinel.description}
          </p>
        )}
      </div>

      {modelSpecs.length > 0 && (
        <div
          className={cn(
            'grid gap-px bg-[var(--color-border-strong)]',
            modelSpecs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {modelSpecs.map(spec => (
            <PracticeSentinelSpecTile
              key={spec.label}
              label={spec.label}
              value={spec.value.toUpperCase()}
            />
          ))}
        </div>
      )}

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
