export type Prompt = {
  prompt: string
  is_success: boolean
  drained_to: string
}

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  image: string
}

export type ConsumePromptApiResponse = {
  response: {
    intent: number
    timestamp_ms: number
    data: {
      agent_id: string
      success: boolean
      explanation: string
      score: number
    }
  }
  signature: string
}

export interface AgentDetails {
  agent_id: string
  agent_object_id: string
  creator: string
  cost_per_message: number
  system_prompt: string
  balance: number
  agent_name: string
  is_featured: boolean
  agent_profile: string
}
