import type { VoiceCallStatus } from '@/types/voice'

interface VoiceCallCaption {
  /** Terminal-style status word shown right under the orb. */
  label: string
  /** Optional second line telling the user what they can do next. */
  hint?: string
}

export const VOICE_CALL_CAPTIONS: Record<VoiceCallStatus, VoiceCallCaption> = {
  idle: { label: 'TAP_TO_TALK', hint: 'Speak your attack out loud' },
  connecting: { label: 'CONNECTING', hint: 'Allow microphone access to continue' },
  listening: { label: 'LISTENING', hint: 'Start talking whenever you are ready' },
  'user-speaking': { label: 'RECEIVING' },
  transcribing: { label: 'TRANSCRIBING' },
  thinking: { label: 'SENTINEL_PROCESSING' },
  speaking: { label: 'SENTINEL_SPEAKING', hint: 'Tap the orb to interrupt' },
  error: { label: 'CONNECTION_FAILED', hint: 'Tap the orb to try again' },
}

export type OrbTapAction = 'start' | 'interrupt' | 'none'

/** Tapping the orb means something different depending on where the call is. */
export function getOrbTapAction(status: VoiceCallStatus): OrbTapAction {
  if (status === 'idle' || status === 'error') return 'start'
  if (status === 'speaking') return 'interrupt'
  return 'none'
}
