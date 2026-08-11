'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { LiveToolMeta } from '@/app/defend/agentic-types'

interface LiveToolOptionProps {
  tool: LiveToolMeta
  isEnabled: boolean
  onToggle: () => void
}

export function LiveToolOption({ tool, isEnabled, onToggle }: LiveToolOptionProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
        isEnabled
          ? 'border-[var(--color-gold-primary)]/50 bg-[var(--color-bg-surface)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] opacity-60 hover:opacity-100'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          isEnabled
            ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
            : 'border-[var(--color-border-strong)]'
        )}
      >
        {isEnabled && <Check className="h-3 w-3" />}
      </span>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{tool.name}</span>
          <span className="font-mono text-[10px] text-[var(--color-text-faint)]">
            {tool.tool_id}
          </span>
          <span className="rounded-full border border-[var(--color-border-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
            Live
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">{tool.description}</span>
      </div>
    </button>
  )
}
