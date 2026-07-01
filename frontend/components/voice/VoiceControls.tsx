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

  const toggleMic = () => hmsActions.setLocalAudioEnabled(!isAudioEnabled)

  return (
    <div className="flex items-center justify-center gap-3 border-t border-[var(--color-border-strong)] px-4 py-4">
      <button
        type="button"
        onClick={toggleMic}
        className={cn(
          'button-ghost-terminal flex items-center gap-2 px-5 py-3',
          !isAudioEnabled && 'border-[var(--color-danger)] text-[var(--color-danger)]'
        )}
      >
        {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        <span>{isAudioEnabled ? 'MUTE' : 'UNMUTE'}</span>
      </button>

      <button
        type="button"
        onClick={onLeave}
        className="flex items-center gap-2 border border-[var(--color-danger)] px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)] hover:text-white"
      >
        <PhoneOff className="h-4 w-4" />
        <span>LEAVE</span>
      </button>
    </div>
  )
}
