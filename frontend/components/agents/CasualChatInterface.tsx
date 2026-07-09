'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { CasualMessageFeed } from './CasualMessageFeed'
import { CasualPromptComposer } from './CasualPromptComposer'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'

interface CasualChatInterfaceProps {
  agent: Agent
}

export function CasualChatInterface({ agent }: CasualChatInterfaceProps) {
  const { address: connectedAddress } = useConnectedAddress()
  const [anonAddress, setAnonAddress] = useState('')

  const [promptInput, setPromptInput] = useState('')
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!connectedAddress) setAnonAddress(getPracticeAttackerAddress())
  }, [connectedAddress])
  const attackerAddress = connectedAddress ?? anonAddress

  const chat = useAttackPracticeSentinel()
  const isSubmitting = chat.isPending

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
    setMessages(prev => [...prev, userMessage])
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
      setMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          type: 'agent',
          content: data.agent_response,
          timestamp: Date.now().toString(),
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Message failed to send'
      setSubmitError(message)
      toast.error(message)
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
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
