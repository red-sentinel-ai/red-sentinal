export interface PracticeSentinel {
  sentinel_id: number
  name: string | null
  description: string | null
  sentinel_type: string
  public_instructions: string
  attack_goal: string
  model_provider: string
  model_name: string
  difficulty_level: number
  is_active: boolean
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
  difficulty_level: number
  is_active: boolean
}

export interface PracticeAttackResponse {
  session_id: string
  turn: number
  agent_response: string
  jury_response: string
  success: boolean
  score: number
  confidence: number
}

export interface PracticeAttackVerdict {
  success: boolean
  score: number
  confidence: number
  juryResponse: string
}

export type PracticeAttackMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; verdict: PracticeAttackVerdict }
