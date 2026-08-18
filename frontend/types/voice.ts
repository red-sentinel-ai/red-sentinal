export interface VoiceTokenResponse {
  auth_token: string
  room_id: string
  role: string
  user_id: string
}

/**
 * Where a voice call is in its turn cycle. The orb, its caption and the
 * controls are all derived from this one value.
 */
export type VoiceCallStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'user-speaking'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'error'

export type VoiceTurnSpeaker = 'attacker' | 'sentinel'

export interface VoiceTurn {
  id: string
  speaker: VoiceTurnSpeaker
  text: string
  /** True while this is a live transcript the backend may still revise. */
  isPartial?: boolean
  /** Set on sentinel turns that were judged a breach. */
  isBreach?: boolean
  score?: number
}

/** What the sentinel says back to a spoken attack, plus the jury's verdict. */
export interface SentinelVoiceReply {
  text: string
  isBreach?: boolean
  score?: number
}

/**
 * Runs one spoken attack through whichever pipeline the surface owns — the
 * practice API, the casual chat API, or an on-chain `consume-prompt`. The voice
 * layer never knows which; it only awaits the reply it should speak.
 */
export type SentinelVoiceTurnHandler = (spokenPrompt: string) => Promise<SentinelVoiceReply>
