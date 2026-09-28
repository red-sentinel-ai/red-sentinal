export interface PracticeSentinel {
  sentinel_id: number
  name: string | null
  description: string | null
  sentinel_type: string
  public_instructions: string
  attack_goal: string
  model_provider: string
  model_name: string
  is_active: boolean
  is_breached: boolean
  visibility: string
  created_at: string
}

export interface PracticeSentinelsResponse {
  sentinels: PracticeSentinel[]
  total: number
  page: number
  limit: number
}

export interface PracticeSentinelPublic {
  sentinel_id: number
  name: string
  description: string | null
  sentinel_type: string
  public_instructions: string
  attack_goal: string
  model_provider?: string
  model_name?: string
  is_active: boolean
}

export type SentinelInteractionMode = 'attack' | 'chat'

export interface PracticeAttackResponse {
  session_id: string
  turn: number
  agent_response: string
  mode?: SentinelInteractionMode
  jury_response?: string
  success?: boolean
  score?: number
  confidence?: number
  /** Mongo id of the attack doc — used to store the record on Walrus. */
  attack_id?: string
}

/** One turn in the public feed (GET /practice/{network}/{id}/attacks). */
export interface PracticeAttackFeedItem {
  type: 'prompt'
  id: string
  mode: SentinelInteractionMode
  session_id: string | null
  sender: string | null
  content: string
  agent_response: string
  jury_response: string | null
  walrus_blob_id: string | null
  score: number | null
  success: boolean | null
  confidence: number | null
  turn: number | null
  timestamp: string | null
}

export interface PracticeAttacksFeedResponse {
  messages: PracticeAttackFeedItem[]
  total: number
  limit: number
  offset: number
}
