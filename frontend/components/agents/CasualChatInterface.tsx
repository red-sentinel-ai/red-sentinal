'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import type { Agent } from '@/types/agents'
import type { PracticeAttackResponse } from '@/types/practice'
import type { SentinelVoiceTurnHandler } from '@/types/voice'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { CasualMessageFeed } from './CasualMessageFeed'
import { CasualPromptComposer } from './CasualPromptComposer'
import { SentinelVoiceCallOverlay } from '@/components/sentinel-voice/SentinelVoiceCallOverlay'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAttackFeedMessages } from '@/hooks/practice/useAttackFeedMessages'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'

interface CasualChatInterfaceProps {
  agent: Agent
}

export function CasualChatInterface({ agent }: CasualChatInterfaceProps) {
  const { address: connectedAddress } = useConnectedAddress()
  const [anonAddress, setAnonAddress] = useState('')

  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessageType[] | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false)

  // Typed and spoken messages share one conversation with the sentinel. A ref
  // rather than state: nothing renders it, and a spoken turn started moments
  // after a typed one must see the id the typed one just returned.
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!connectedAddress) setAnonAddress(getPracticeAttackerAddress())
  }, [connectedAddress])
  const attackerAddress = connectedAddress ?? anonAddress

  const { data: feed, refetch: refetchFeed } = usePracticeAttacksFeed(agent.agent_id, {
    network: agent.casual_network,
    mode: 'chat',
  })
  const chat = useAttackPracticeSentinel()
  const isSubmitting = chat.isPending

  const { messages, isRoundIndexed } = useAttackFeedMessages(feed, pendingRound)

  useEffect(() => {
    if (pendingRound && isRoundIndexed) setPendingRound(null)
  }, [pendingRound, isRoundIndexed])

  /**
   * One message exchange, shared by the composer and the voice call: show the
   * prompt optimistically, send it, then show the reply. Throws on failure so
   * each caller can restore its own input state.
   */
  const runChatRound = async (prompt: string): Promise<PracticeAttackResponse> => {
    setPendingRound([
      {
        id: `user-${Date.now()}`,
        type: 'user',
        content: prompt,
        timestamp: Date.now().toString(),
        sender: attackerAddress,
      },
    ])

    try {
      const data = await chat.mutateAsync({
        sentinelId: agent.agent_id,
        network: agent.casual_network,
        attackerAddress,
        userPrompt: prompt,
        sessionId: sessionIdRef.current,
        mode: 'chat',
      })
      sessionIdRef.current = data.session_id

      const agentMessage: ChatMessageType = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        content: data.agent_response,
        timestamp: Date.now().toString(),
      }
      setPendingRound(prev => (prev ? [...prev, agentMessage] : [agentMessage]))

      refetchFeed()
      return data
    } catch (err) {
      setPendingRound(null)
      throw err
    }
  }

  const handleSubmit = async () => {
    const prompt = promptInput.trim()
    if (!prompt || isSubmitting || !attackerAddress) return

    setSubmitError(null)
    setPromptInput('')

    try {
      await runChatRound(prompt)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Message failed to send'
      setSubmitError(message)
      toast.error(message)
      setPromptInput(prompt)
    }
  }

  const handleVoiceTurn: SentinelVoiceTurnHandler = async spokenPrompt => {
    const data = await runChatRound(spokenPrompt)
    return { text: data.agent_response }
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-[var(--color-bg-base)]">
      <CasualMessageFeed agent={agent} messages={messages} isSubmitting={isSubmitting} />

      <CasualPromptComposer
        value={promptInput}
        onChange={setPromptInput}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        onStartVoiceCall={() => setIsVoiceCallOpen(true)}
      />

      {isVoiceCallOpen && (
        <SentinelVoiceCallOverlay
          sentinelName={agent.agent_name}
          onClose={() => setIsVoiceCallOpen(false)}
          onUserTurn={handleVoiceTurn}
        />
      )}
    </div>
  )
}
