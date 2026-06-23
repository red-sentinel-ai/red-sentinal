import type { LucideIcon } from 'lucide-react'

export interface ChatRoomMessage {
  id: string
  sender_address: string
  sender_role: string
  content: string
  created_at: string
}

export interface ChatRoleStyle {
  icon: LucideIcon
  label: string
  color: string
}

export type ChatRoleStyleMap = Record<string, ChatRoleStyle>
