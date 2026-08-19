'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Mic, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { CasualMessageFeed } from './CasualMessageFeed'
import { CasualPromptComposer } from './CasualPromptComposer'
import { VoiceChatSurface } from '@/components/voice/VoiceChatSurface'
import { getPracticeAttackerAddress } from '@/lib/practice'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useAttackFeedMessages } from '@/hooks/practice/useAttackFeedMessages'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'
import { useSentinelVoice } from '@/hooks/voice'
import type { VoiceTranscript } from '@/types/voice'

interface CasualChatInterfaceProps {
  agent: Agent
}

function generateVoiceSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function transcriptToChatMessage(transcript: VoiceTranscript, sender?: string): ChatMessageType {
  return {
    id: `voice-${transcript.id}`,
    type: transcript.role === 'user' ? 'user' : 'agent',
    content: transcript.text,
    timestamp: transcript.createdAt.toString(),
    sender: transcript.role === 'user' ? sender : undefined,
  }
}

export function CasualChatInterface({ agent }: CasualChatInterfaceProps) {
  const { address: connectedAddress } = useConnectedAddress()
  const [anonAddress, setAnonAddress] = useState('')

  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessageType[] | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text'>('voice')
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  const isBreached = agent.state === 'defeated'

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

  const { messages: feedMessages, isRoundIndexed } = useAttackFeedMessages(feed, pendingRound)

  const voice = useSentinelVoice({
    sentinelId: agent.agent_id,
    network: agent.casual_network ?? 'sui:testnet',
    attackerAddress,
    sessionId: sessionId ?? generateVoiceSessionId(),
    instructions: agent.prompt,
  })

  const voiceMessages = useMemo<ChatMessageType[]>(() => {
    return voice.transcripts
      .filter(t => !t.partial)
      .map(t => transcriptToChatMessage(t, attackerAddress))
  }, [voice.transcripts, attackerAddress])

  const messages = useMemo<ChatMessageType[]>(
    () => [...feedMessages, ...voiceMessages],
    [feedMessages, voiceMessages]
  )

  useEffect(() => {
    if (pendingRound && isRoundIndexed) setPendingRound(null)
  }, [pendingRound, isRoundIndexed])

  // Voice is disabled once the sentinel is breached.
  useEffect(() => {
    if (isBreached && interactionMode === 'voice') {
      setInteractionMode('text')
      if (isVoiceActive) {
        setIsVoiceActive(false)
        voice.stop()
      }
    }
  }, [isBreached, interactionMode, isVoiceActive, voice])

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

      refetchFeed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Message failed to send'
      setSubmitError(message)
      toast.error(message)
      setPendingRound(null)
      setPromptInput(prompt)
    }
  }

  const handleStartVoice = useCallback(() => {
    if (!attackerAddress) {
      toast.error('Please connect your wallet or wait for an anonymous address.')
      return
    }
    setIsVoiceActive(true)
  }, [attackerAddress])

  const handleHangUp = useCallback(async () => {
    setIsVoiceActive(false)
    await voice.stop()
    refetchFeed()
  }, [voice.stop, refetchFeed])

  const handleSetMode = useCallback(
    async (mode: 'voice' | 'text') => {
      if (mode === 'voice' && isBreached) return
      if (mode === 'text' && isVoiceActive) {
        setIsVoiceActive(false)
        await voice.stop()
      }
      setInteractionMode(mode)
    },
    [isBreached, isVoiceActive, voice.stop]
  )

  useEffect(() => {
    if (isVoiceActive) {
      voice.start()
    }
  }, [isVoiceActive, voice.start])

  const isVoiceMode = interactionMode === 'voice' && !isBreached

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg-base)]">
      <div className="chat-toolbar flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ModeButton
            mode="voice"
            currentMode={interactionMode}
            onClick={() => handleSetMode('voice')}
            icon={Mic}
            label="VOICE"
            disabled={isBreached}
          />
          <ModeButton
            mode="text"
            currentMode={interactionMode}
            onClick={() => handleSetMode('text')}
            icon={MessageSquare}
            label="TEXT"
          />
        </div>
        {isBreached ? (
          <span className="industrial-header ml-auto text-[9px] tracking-widest text-[var(--color-danger)] sm:tracking-[4px]">
            VOICE DISABLED // BREACHED
          </span>
        ) : (
          <span className="industrial-header text-[var(--color-text-muted)]/60 ml-auto hidden text-[9px] tracking-[4px] sm:block">
            FREE // OFF-CHAIN
          </span>
        )}
      </div>

      <CasualMessageFeed
        agent={agent}
        messages={messages}
        isSubmitting={isSubmitting}
        className={isVoiceMode ? 'hidden md:flex' : undefined}
      />

      {isVoiceMode ? (
        <div className="min-h-0 flex-1 border-t border-[var(--color-border-strong)] md:min-h-[240px] md:flex-none md:shrink-0">
          <VoiceChatSurface
            agentName={agent.agent_name || 'Sentinel'}
            status={voice.status}
            transcripts={voice.transcripts}
            error={voice.error}
            isMuted={voice.isMuted}
            isConnected={voice.isConnected}
            isActive={isVoiceActive}
            onStart={handleStartVoice}
            onToggleMute={voice.toggleMute}
            onHangUp={handleHangUp}
          />
        </div>
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

function ModeButton({
  mode,
  currentMode,
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  mode: 'voice' | 'text'
  currentMode: 'voice' | 'text'
  onClick: () => void
  icon: typeof Mic
  label: string
  disabled?: boolean
}) {
  const active = mode === currentMode
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'industrial-header flex items-center gap-1 px-2 py-1 text-[9px] tracking-wider transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[10px]',
        active
          ? 'bg-white text-black'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-white',
        disabled &&
          'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[var(--color-text-muted)]'
      )}
      aria-pressed={active}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  )
}
