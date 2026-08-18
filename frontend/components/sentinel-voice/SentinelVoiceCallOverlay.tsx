'use client'

import { X } from 'lucide-react'

import { useSentinelVoiceConversation } from '@/hooks/voice'
import type { SentinelVoiceTurnHandler } from '@/types/voice'
import { SentinelVoiceControls } from './SentinelVoiceControls'
import { SentinelVoiceOrb } from './SentinelVoiceOrb'
import { SentinelVoiceTranscript } from './SentinelVoiceTranscript'
import { VOICE_CALL_CAPTIONS } from './voice-call-copy'

interface SentinelVoiceCallOverlayProps {
  sentinelName: string
  onClose: () => void
  onUserTurn: SentinelVoiceTurnHandler
  /**
   * Shown under the orb instead of the usual hint — for example the per-message
   * cost of an on-chain attack, or why voice is unavailable right now.
   */
  callNotice?: string
}

/**
 * Full-screen audio-to-audio conversation with a sentinel.
 *
 * Render it conditionally (`{isOpen && <SentinelVoiceCallOverlay … />}`) so
 * unmounting tears the call down: the hook releases the microphone, socket and
 * AudioContext on cleanup.
 *
 * The call never starts on its own — the user taps the orb. That tap is the
 * gesture iOS Safari requires before an AudioContext may produce sound, and it
 * doubles as consent for the microphone prompt that follows.
 */
export function SentinelVoiceCallOverlay({
  sentinelName,
  onClose,
  onUserTurn,
  callNotice,
}: SentinelVoiceCallOverlayProps) {
  const {
    status,
    turns,
    errorMessage,
    isMuted,
    startCall,
    endCall,
    toggleMute,
    interruptSentinel,
    attachOrbElement,
  } = useSentinelVoiceConversation(onUserTurn)

  const caption = VOICE_CALL_CAPTIONS[status]

  const handleClose = () => {
    endCall()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-black">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-4">
        <span className="industrial-header truncate text-[11px] tracking-widest text-white">
          {sentinelName.toUpperCase().replace(/\s+/g, '_')}
        </span>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close voice conversation"
          className="flex h-9 w-9 items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <section className="flex shrink-0 flex-col items-center gap-4 px-4 py-6">
        <SentinelVoiceOrb
          status={status}
          onStart={startCall}
          onInterrupt={interruptSentinel}
          onMount={attachOrbElement}
        />

        <div className="min-h-[2.5rem] text-center">
          <p className="industrial-header text-[11px] tracking-[0.2em] text-white">
            {caption.label}
          </p>
          {(callNotice || caption.hint) && (
            <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
              {callNotice ?? caption.hint}
            </p>
          )}
        </div>
      </section>

      <SentinelVoiceTranscript turns={turns} sentinelName={sentinelName} />

      {errorMessage && (
        <p className="shrink-0 px-4 py-2 text-center font-mono text-[10px] text-[var(--color-danger)]">
          {errorMessage}
        </p>
      )}

      <footer className="shrink-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
        <SentinelVoiceControls
          status={status}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onEndCall={handleClose}
        />
      </footer>
    </div>
  )
}
