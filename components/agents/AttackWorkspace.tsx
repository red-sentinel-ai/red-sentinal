'use client'

import type { SupportedChain } from '@/constants/chains'
import type { Agent } from '@/types/agents'
import type { ConsumePromptApiResponse } from '@/types'
import type { ChatEvent } from '@/hooks/agents/useAgentChatHistory'
import ChatInterface from './ChatInterface'
import { ChatRoom } from './ChatRoom'

export type ViewMode = 'attack' | 'chat'

interface AttackWorkspaceProps {
  agent: Agent
  viewMode: ViewMode
  onBackToAttack: () => void
  chatEvents: ChatEvent[]
  eventsLoading?: boolean
  apiResponse: ConsumePromptApiResponse | null
  onSendMessage: (prompt: string) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  refetchAgent: () => void
  chainMismatch?: SupportedChain | null
}

export function AttackWorkspace({
  agent,
  viewMode,
  onBackToAttack,
  chatEvents,
  eventsLoading,
  apiResponse,
  onSendMessage,
  isSubmitting,
  submitError,
  refetchAgent,
  chainMismatch,
}: AttackWorkspaceProps) {
  if (viewMode === 'chat') {
    return <ChatRoom agent={agent} onBack={onBackToAttack} />
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <ChatInterface
          agent={agent}
          chatEvents={chatEvents}
          eventsLoading={eventsLoading}
          apiResponse={apiResponse}
          onSendMessage={onSendMessage}
          isSubmitting={isSubmitting}
          submitError={submitError}
          refetchAgent={refetchAgent}
          chainMismatch={chainMismatch}
        />
      </div>
    </div>
  )
}
