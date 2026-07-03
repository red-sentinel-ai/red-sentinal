'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { JuryResponseModal } from './JuryResponseModal'
import { CasualMessageFeed } from './CasualMessageFeed'
import { CasualPromptComposer } from './CasualPromptComposer'
import { CasualWinCelebration } from './CasualWinCelebration'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { useAttackFeedMessages } from '@/hooks/practice/useAttackFeedMessages'

interface CasualChatInterfaceProps {
  agent: Agent
  onSwitchToAttackMode: () => void
}

export function CasualChatInterface({ agent, onSwitchToAttackMode }: CasualChatInterfaceProps) {
  const { address: connectedAddress } = useConnectedAddress()
  const [anonAddress, setAnonAddress] = useState('')

  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessageType[] | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [juryResponse, setJuryResponse] = useState<string | null>(null)
  const [hasWon, setHasWon] = useState(false)

  useEffect(() => {
    if (!connectedAddress) setAnonAddress(getPracticeAttackerAddress())
  }, [connectedAddress])
  const attackerAddress = connectedAddress ?? anonAddress

  const { data: feed, refetch: refetchFeed } = usePracticeAttacksFeed(agent.agent_id, {
    network: agent.casual_network,
    excludeOnchain: true,
  })
  const { messages, isRoundIndexed } = useAttackFeedMessages(feed, pendingRound)

  const attack = useAttackPracticeSentinel()
  const isSubmitting = attack.isPending

  useEffect(() => {
    if (pendingRound && isRoundIndexed) setPendingRound(null)
  }, [pendingRound, isRoundIndexed])

  const handleReset = () => {
    setPendingRound(null)
    setSessionId(null)
    setSubmitError(null)
    setHasWon(false)
    if (!connectedAddress) setAnonAddress(getPracticeAttackerAddress(true))
  }

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
      const data = await attack.mutateAsync({
        sentinelId: agent.agent_id,
        network: agent.casual_network,
        attackerAddress,
        userPrompt: prompt,
        sessionId,
      })
      setSessionId(data.session_id)
      setPendingRound(prev => [
        ...(prev ?? []),
        {
          id: `agent-${Date.now()}`,
          type: 'agent',
          content: data.agent_response,
          timestamp: Date.now().toString(),
          isSuccess: data.success,
          score: data.score,
          juryResponse: data.jury_response,
        },
      ])
      if (data.success) {
        setHasWon(true)
        toast.success('You cracked it — sentinel breached!')
      }
      refetchFeed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Casual attack failed'
      setSubmitError(message)
      toast.error(message)
      setPendingRound(null)
      setPromptInput(prompt)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-[var(--color-bg-base)]">
      <JuryResponseModal
        isOpen={juryResponse !== null}
        onClose={() => setJuryResponse(null)}
        response={juryResponse ?? ''}
      />

      <CasualMessageFeed
        agent={agent}
        messages={messages}
        attackerAddress={attackerAddress}
        isSubmitting={isSubmitting}
        onShowJury={setJuryResponse}
      />

      {hasWon ? (
        <CasualWinCelebration onAttackForReal={onSwitchToAttackMode} onReset={handleReset} />
      ) : (
        <CasualPromptComposer
          value={promptInput}
          onChange={setPromptInput}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      )}
    </div>
  )
}
