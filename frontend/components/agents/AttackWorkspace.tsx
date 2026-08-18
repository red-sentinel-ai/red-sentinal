'use client'

import type { SupportedChain } from '@/constants/chains'
import type { Agent } from '@/types/agents'
import type { ConsumePromptApiResponse } from '@/types'
import type { ChatEvent } from '@/hooks/agents/useAgentChatHistory'
import ChatInterface from './ChatInterface'
import { ChatRoom } from './ChatRoom'
import { CasualChatInterface } from './CasualChatInterface'
import { ChallengeModeToggle, type ChallengeMode } from './ChallengeModeToggle'

export type ViewMode = 'attack' | 'chat'

interface AttackWorkspaceProps {
  agent: Agent
  viewMode: ViewMode
  onBackToAttack: () => void
  challengeMode: ChallengeMode
  onChangeChallengeMode: (mode: ChallengeMode) => void
  /** False when the mode toggle is hoisted into the app topbar (mobile). */
  showModeToggle?: boolean
  chatEvents: ChatEvent[]
  eventsLoading?: boolean
  apiResponse: ConsumePromptApiResponse | null
  onSendMessage: (prompt: string) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  refetchAgent: () => void
  chainMismatch?: SupportedChain | null
  onStartVoiceCall: () => void
}

export function AttackWorkspace({
  agent,
  viewMode,
  onBackToAttack,
  challengeMode,
  onChangeChallengeMode,
  showModeToggle = true,
  chatEvents,
  eventsLoading,
  apiResponse,
  onSendMessage,
  isSubmitting,
  submitError,
  refetchAgent,
  chainMismatch,
  onStartVoiceCall,
}: AttackWorkspaceProps) {
  if (viewMode === 'chat') {
    return <ChatRoom agent={agent} onBack={onBackToAttack} />
  }

  return (
    <div className="flex h-full flex-col">
      {showModeToggle && (
        <div className="flex shrink-0 items-center justify-center border-b border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 py-2">
          <ChallengeModeToggle mode={challengeMode} onChange={onChangeChallengeMode} />
        </div>
      )}

      <div className="min-h-0 flex-1">
        {challengeMode === 'casual' ? (
          <CasualChatInterface agent={agent} />
        ) : (
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
            onStartVoiceCall={onStartVoiceCall}
          />
        )}
      </div>
    </div>
  )
}
