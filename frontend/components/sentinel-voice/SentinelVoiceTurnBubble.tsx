'use client'

import { cn } from '@/lib/utils'
import type { VoiceTurn } from '@/types/voice'

interface SentinelVoiceTurnBubbleProps {
  turn: VoiceTurn
  sentinelName: string
}

export function SentinelVoiceTurnBubble({ turn, sentinelName }: SentinelVoiceTurnBubbleProps) {
  const isAttacker = turn.speaker === 'attacker'

  return (
    <div
      className={cn(
        'border-l-2 px-3 py-2',
        isAttacker
          ? 'border-[var(--color-info)] bg-[var(--color-bg-surface)]'
          : 'border-[var(--color-accent)] bg-[var(--color-bg-elevated)]',
        turn.isBreach && 'border-[var(--color-success)] bg-[var(--color-success-muted)]'
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="industrial-header text-[9px] tracking-widest text-[var(--color-text-muted)]">
          {isAttacker ? 'YOU' : sentinelName.toUpperCase().replace(/\s+/g, '_')}
        </span>
        {turn.isBreach && (
          <span className="industrial-header text-[9px] tracking-widest text-[var(--color-success)]">
            BREACHED{typeof turn.score === 'number' && ` · ${turn.score}`}
          </span>
        )}
      </div>

      <p
        className={cn(
          'mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed',
          turn.isPartial ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'
        )}
      >
        {turn.text}
      </p>
    </div>
  )
}
