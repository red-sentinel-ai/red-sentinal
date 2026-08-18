'use client'

import { AlertTriangle, Mic, Volume2 } from 'lucide-react'

import type { VoiceCallStatus } from '@/types/voice'

const BAR_COUNT = 5

/**
 * The glyph at the centre of the orb. Exactly one is shown at a time, chosen by
 * the call's status, so the orb reads as a single instrument rather than a
 * dashboard.
 */
export function SentinelVoiceOrbIndicator({ status }: { status: VoiceCallStatus }) {
  switch (status) {
    case 'connecting':
    case 'transcribing':
      return <span className="voice-orb-spinner" />

    case 'listening':
    case 'user-speaking':
      return (
        <span className="voice-orb-bars">
          {Array.from({ length: BAR_COUNT }, (_, index) => (
            <span key={index} className="voice-orb-bar" />
          ))}
        </span>
      )

    case 'thinking':
      return (
        <span className="voice-orb-dots">
          <span className="voice-orb-dot" />
          <span className="voice-orb-dot" />
          <span className="voice-orb-dot" />
        </span>
      )

    case 'speaking':
      return <Volume2 className="voice-orb-glyph" strokeWidth={1.6} />

    case 'error':
      return <AlertTriangle className="voice-orb-glyph" strokeWidth={1.6} />

    default:
      return <Mic className="voice-orb-glyph" strokeWidth={1.6} />
  }
}
