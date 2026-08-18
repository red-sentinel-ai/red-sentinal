'use client'

import { Mic, MicOff, PhoneOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { VoiceCallStatus } from '@/types/voice'

interface SentinelVoiceControlsProps {
  status: VoiceCallStatus
  isMuted: boolean
  onToggleMute: () => void
  onEndCall: () => void
}

/**
 * Mute and hang-up, sized for thumbs. Both are hidden until a call is actually
 * running — before that the orb is the only control.
 */
export function SentinelVoiceControls({
  status,
  isMuted,
  onToggleMute,
  onEndCall,
}: SentinelVoiceControlsProps) {
  const isCallRunning = status !== 'idle' && status !== 'error'
  if (!isCallRunning) return null

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={cn(
          'flex h-14 w-14 items-center justify-center border transition-colors',
          isMuted
            ? 'border-[var(--color-warning)] text-[var(--color-warning)]'
            : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-white hover:text-white'
        )}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      <button
        type="button"
        onClick={onEndCall}
        aria-label="End voice conversation"
        className="flex h-14 w-14 items-center justify-center border border-[var(--color-danger)] text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-muted)]"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  )
}
