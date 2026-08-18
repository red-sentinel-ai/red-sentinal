'use client'

import { cn } from '@/lib/utils'
import type { VoiceCallStatus } from '@/types/voice'
import { SentinelVoiceOrbIndicator } from './SentinelVoiceOrbIndicator'
import { getOrbTapAction, type OrbTapAction } from './voice-call-copy'

interface SentinelVoiceOrbProps {
  status: VoiceCallStatus
  onStart: () => void
  onInterrupt: () => void
  /**
   * Ref callback from `useSentinelVoiceConversation`. The audio level writer
   * paints CSS custom properties onto this element every animation frame.
   */
  onMount: (element: HTMLElement | null) => void
}

const ORB_ACCESSIBLE_LABELS: Record<OrbTapAction, string> = {
  start: 'Start talking to this sentinel',
  interrupt: 'Interrupt the sentinel',
  none: 'Voice conversation in progress',
}

export function SentinelVoiceOrb({ status, onStart, onInterrupt, onMount }: SentinelVoiceOrbProps) {
  const tapAction = getOrbTapAction(status)

  return (
    <button
      ref={onMount}
      type="button"
      onClick={tapAction === 'start' ? onStart : tapAction === 'interrupt' ? onInterrupt : undefined}
      disabled={tapAction === 'none'}
      aria-label={ORB_ACCESSIBLE_LABELS[tapAction]}
      className={cn('voice-orb', `voice-orb--${status}`)}
    >
      <span className="voice-orb-glow" aria-hidden="true" />
      <span className="voice-orb-ring" aria-hidden="true" />
      <span className="voice-orb-ring-outer" aria-hidden="true" />
      <span className="voice-orb-core">
        <span className="voice-orb-indicator" aria-hidden="true">
          <SentinelVoiceOrbIndicator status={status} />
        </span>
      </span>
    </button>
  )
}
