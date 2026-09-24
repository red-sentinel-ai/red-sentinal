export interface VoiceTokenResponse {
  auth_token: string
  room_id: string
  role: string
  user_id: string
}

export type VoiceTranscriptRole = 'user' | 'assistant'

export interface VoiceTranscript {
  id: string
  role: VoiceTranscriptRole
  text: string
  partial: boolean
  createdAt: number
}

export type VoiceStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'user-speaking'
  | 'processing'
  | 'ai-speaking'
  | 'closed'
  | 'error'

export interface UseSentinelVoiceOptions {
  sentinelId: number | string
  network: string
  attackerAddress: string
  sessionId: string
  instructions: string
  voice?: string
  startupGreeting?: string
}
