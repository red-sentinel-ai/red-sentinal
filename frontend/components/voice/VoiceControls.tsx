'use client'

import { Mic, MicOff, PhoneOff } from 'lucide-react'
import { selectIsLocalAudioEnabled, useHMSActions, useHMSStore } from '@100mslive/react-sdk'
import { cn } from '@/lib/utils'

interface VoiceControlsProps {
  onLeave: () => void
}

export function VoiceControls({ onLeave }: VoiceControlsProps) {
  const hmsActions = useHMSActions()
  const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled)

  return (
    <div className="flex shrink-0 items-center justify-center gap-5 px-4 py-4 pb-safe">
      {/* Mic toggle — circular, phone-call style */}
      <button
        type="button"
        onClick={() => hmsActions.setLocalAudioEnabled(!isAudioEnabled)}
        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border transition-colors',
          isAudioEnabled
            ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
            : 'border-[var(--color-danger)] bg-[var(--color-danger)] text-white'
        )}
      >
        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>

      {/* Leave — red circular hang-up */}
      <button
        type="button"
        onClick={onLeave}
        aria-label="Leave voice room"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)] bg-[var(--color-danger)] text-white transition-transform active:scale-95"
      >
        <PhoneOff className="h-6 w-6" />
      </button>
    </div>
  )
}
