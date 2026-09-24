export type SyndicateChatRole = 'owner' | 'member'

export interface SyndicateChatMessage {
  id: string
  room_id: string
  sender_address: string
  sender_role: SyndicateChatRole
  content: string
  created_at: string
}

export interface SyndicateChatMessagesResponse {
  messages: SyndicateChatMessage[]
  total: number
}

export interface SyndicateChatAccessResponse {
  can_access: boolean
  role: SyndicateChatRole | null
}
