'use client'

import { Loader2, Square, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SpeechPlaybackStatus } from '@/hooks/useSpeechPlayback'

type SentinelSpeechButtonVariant = 'terminal' | 'plain'

interface SentinelSpeechButtonProps {
  status: SpeechPlaybackStatus
  onToggle: () => void
  variant?: SentinelSpeechButtonVariant
}

const LABELS: Record<
  SentinelSpeechButtonVariant,
  Record<SpeechPlaybackStatus, string>
> = {
  terminal: { idle: 'READ_ALOUD', loading: 'GENERATING', playing: 'STOP' },
  plain: { idle: 'Read aloud', loading: 'Generating…', playing: 'Stop' }
}

const VARIANT_CLASSES: Record<SentinelSpeechButtonVariant, string> = {
  terminal: 'industrial-header text-accent text-[10px]',
  plain: 'text-[13px] font-medium text-[var(--color-accent)]'
}

export function SentinelSpeechButton({
  status,
  onToggle,
  variant = 'terminal'
}: SentinelSpeechButtonProps) {
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        onToggle()
      }}
      disabled={status === 'loading'}
      className={cn(
        'flex items-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-50',
        VARIANT_CLASSES[variant]
      )}
    >
      {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {status === 'playing' && <Square className="h-3.5 w-3.5" />}
      {status === 'idle' && <Volume2 className="h-3.5 w-3.5" />}
      {LABELS[variant][status]}
    </button>
  )
}
