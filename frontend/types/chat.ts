export type ChatSenderRole = 'owner' | 'attacker' | 'syndicate_member'

export interface ChatMessage {
  id: string
  room_id: string
  sender_address: string
  sender_role: ChatSenderRole
  content: string
  created_at: string
}

export interface ChatMessagesResponse {
  messages: ChatMessage[]
  total: number
}

export interface SendMessageRequest {
  content: string
  sender_address: string
}

export interface MentionUser {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export interface MentionSuggestionsResponse {
  users: MentionUser[]
}

export interface SendMessageResponse {
  message: ChatMessage
  mentions: MentionUser[]
}

export interface CanSendResponse {
  can_send: boolean
  role: ChatSenderRole | null
}

// For optimistic updates
export interface OptimisticChatMessage extends ChatMessage {
  isOptimistic?: boolean
  isFailed?: boolean
}
