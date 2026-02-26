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
      agent_response: string
      fun_response: string
      jury_response: string
      score: number
    }
  }
  signature: string
}

export type AgentStatus = 'active' | 'defeated'
