'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { CasualMessageFeed } from './CasualMessageFeed'
import { CasualPromptComposer } from './CasualPromptComposer'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { playSpeech } from '@/lib/speech-playback'
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
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

  const handleSubmit = async () => {
    const prompt = promptInput.trim()
    if (!prompt || isSubmitting || !attackerAddress) return

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: prompt,
      timestamp: Date.now().toString(),
      sender: attackerAddress,
    }

    setSubmitError(null)
    setPendingRound([userMessage])
    setPromptInput('')

    try {
      const data = await chat.mutateAsync({
        sentinelId: agent.agent_id,
        network: agent.casual_network,
        attackerAddress,
        userPrompt: prompt,
        sessionId,
        mode: 'chat',
      })
      setSessionId(data.session_id)

      const agentMessage: ChatMessageType = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        content: data.agent_response,
        timestamp: Date.now().toString(),
      }
      setPendingRound(prev => (prev ? [...prev, agentMessage] : [agentMessage]))
      playSpeech(agentMessage.content)

      refetchFeed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Message failed to send'
      setSubmitError(message)
      toast.error(message)
      setPendingRound(null)
      setPromptInput(prompt)
    }
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
      />
    </div>
  )
}
