'use client'

import { Loader2, Square, Volume2 } from 'lucide-react'
import type { SpeechPlaybackStatus } from '@/hooks/useSpeechPlayback'

interface SentinelSpeechButtonProps {
  status: SpeechPlaybackStatus
  onToggle: () => void
}

const LABELS: Record<SpeechPlaybackStatus, string> = {
  idle: 'READ_ALOUD',
  loading: 'GENERATING',
  playing: 'STOP'
}

export function SentinelSpeechButton({
  status,
  onToggle
}: SentinelSpeechButtonProps) {
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        onToggle()
      }}
      disabled={status === 'loading'}
      className="industrial-header text-accent flex items-center gap-1.5 text-[10px] transition-opacity hover:opacity-70 disabled:opacity-50"
    >
      {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {status === 'playing' && <Square className="h-3.5 w-3.5" />}
      {status === 'idle' && <Volume2 className="h-3.5 w-3.5" />}
      {LABELS[status]}
    </button>
  )
}
