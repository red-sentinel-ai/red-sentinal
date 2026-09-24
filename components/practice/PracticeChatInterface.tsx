'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, Zap, Info, Mic, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { generateAvatarUrl } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from '@/components/agents/ChatInterface'
import { ChatMessage } from '@/components/agents/ChatMessage'
import { JuryResponseModal } from '@/components/agents/JuryResponseModal'
import { VoiceChatSurface } from '@/components/voice/VoiceChatSurface'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { useAttackFeedMessages } from '@/hooks/practice/useAttackFeedMessages'
import { useAutoResizingTextarea } from '@/hooks/useAutoResizingTextarea'
import { useSentinelVoice } from '@/hooks/voice'
import { PRACTICE_NETWORK } from '@/lib/practice'
import type { PracticeSentinelPublic } from '@/types/practice'
import type { VoiceTranscript } from '@/types/voice'

const PRACTICE_BREACH_BANNER_LABEL = 'SENTINEL_BREACHED // OBJECTIVE_COMPLETE'

interface PracticeChatInterfaceProps {
  sentinel: PracticeSentinelPublic
  attackerAddress: string
  onOpenSentinelInfo?: () => void
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

export function PracticeChatInterface({
  sentinel,
  attackerAddress,
  onOpenSentinelInfo,
}: PracticeChatInterfaceProps) {
  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessageType[] | null>(null)
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [interactionMode, setInteractionMode] = useState<'voice' | 'text'>('voice')
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useAutoResizingTextarea(promptInput)

  const { data: feed, refetch: refetchFeed } = usePracticeAttacksFeed(sentinel.sentinel_id, {
    mode: 'attack',
  })

  const isBreached = feed?.messages.some(m => m.success === true) ?? false

  const attackMutation = useAttackPracticeSentinel()
  const isSubmitting = attackMutation.isPending

  // ChatMessage is built for on-chain agents; practice only needs name/avatar/chain.
  const agentForMessage = useMemo(
    () =>
      ({
        agent_name: sentinel.name || `Sentinel ${sentinel.sentinel_id}`,
        agent_image: null,
        chain: 'sui',
      }) as unknown as Agent,
    [sentinel]
  )

  const voice = useSentinelVoice({
    sentinelId: sentinel.sentinel_id,
    network: PRACTICE_NETWORK,
    attackerAddress,
    sessionId: sessionId ?? `${Date.now()}`,
    instructions: sentinel.public_instructions,
    voice: 'paul',
  })

  const voiceMessages = useMemo<ChatMessageType[]>(() => {
    return voice.transcripts
      .filter(t => !t.partial)
      .map(t => transcriptToChatMessage(t, attackerAddress))
  }, [voice.transcripts, attackerAddress])

  const { messages: feedMessages, isRoundIndexed } = useAttackFeedMessages(feed, pendingRound)

  const chatMessages = useMemo<ChatMessageType[]>(
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isSubmitting])

  useEffect(() => {
    if (isVoiceActive) {
      voice.start()
    }
  }, [isVoiceActive, voice.start])

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

  const handleStartVoice = useCallback(() => {
    if (!attackerAddress) {
      toast.error('Please wait for your practice identity.')
      return
    }
    setIsVoiceActive(true)
  }, [attackerAddress])

  const handleHangUp = useCallback(async () => {
    setIsVoiceActive(false)
    await voice.stop()
    refetchFeed()
  }, [voice.stop, refetchFeed])

  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false)
  const [selectedJuryResponse, setSelectedJuryResponse] = useState('')

  const handleShowJury = (response: string) => {
    setSelectedJuryResponse(response)
    setIsJuryModalOpen(true)
  }

  const displayedMessages = useMemo(() => {
    if (activeTab === 'global') return chatMessages
    if (!attackerAddress) return []
    const filtered: ChatMessageType[] = []
    for (let i = 0; i < chatMessages.length; i++) {
      const msg = chatMessages[i]
      if (msg.type === 'user' && msg.sender === attackerAddress) {
        filtered.push(msg)
        if (chatMessages[i + 1]?.type === 'agent') {
          filtered.push(chatMessages[i + 1])
          i++
        }
      }
    }
    return filtered
  }, [chatMessages, activeTab, attackerAddress])

  const isVoiceMode = interactionMode === 'voice' && !isBreached

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptInput.trim() || isSubmitting || !attackerAddress) return

    const prompt = promptInput
    const newUserMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: prompt,
      timestamp: Date.now().toString(),
      sender: attackerAddress,
    }

    setSubmitError(null)
    setPendingRound([newUserMessage])
    setPromptInput('')

    try {
      const data = await attackMutation.mutateAsync({
        sentinelId: sentinel.sentinel_id,
        attackerAddress,
        userPrompt: prompt,
        sessionId,
      })
      setSessionId(data.session_id)
      const newAgentMessage: ChatMessageType = {
        id: `agent-new-${Date.now()}`,
        type: 'agent',
        content: data.agent_response,
        timestamp: Date.now().toString(),
        isSuccess: data.success,
        score: data.score,
        juryResponse: data.jury_response,
      }
      setPendingRound(prev => (prev ? [...prev, newAgentMessage] : [newAgentMessage]))
      if (data.success) toast.success('Sentinel breached — attack succeeded!')
      // Pull the feed forward so the optimistic round resolves to server truth.
      refetchFeed()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Attack failed'
      setSubmitError(message)
      toast.error(message)
      setPendingRound(null)
      setPromptInput(prompt)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg-base)]">
      <JuryResponseModal
        isOpen={isJuryModalOpen}
        onClose={() => setIsJuryModalOpen(false)}
        response={selectedJuryResponse}
      />

      {/* Terminal-style Tabs */}
      <div className="chat-toolbar">
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

        {isBreached && (
          <span className="industrial-header ml-2 text-[10px] tracking-[0.06em] text-[var(--color-danger)]">
            VOICE DISABLED // BREACHED
          </span>
        )}

        {interactionMode === 'text' && !isBreached && (
          <>
            <button
              onClick={() => setActiveTab('global')}
              className={clsx(
                'chat-toolbar-tab industrial-header',
                activeTab === 'global'
                  ? 'border-white text-white'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
              )}
            >
              <span className="sm:hidden">GLOBAL</span>
              <span className="hidden sm:inline">GLOBAL_ATTACKS</span>
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={clsx(
                'chat-toolbar-tab industrial-header',
                activeTab === 'mine'
                  ? 'border-white text-white'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
              )}
            >
              <span className="sm:hidden">MINE</span>
              <span className="hidden sm:inline">MY_ATTACKS</span>
            </button>
          </>
        )}

        {onOpenSentinelInfo && (
          <button
            type="button"
            onClick={onOpenSentinelInfo}
            className="chat-toolbar-action ml-auto"
            title="Sentinel info"
          >
            <Info className="h-3 w-3" />
            <span className="industrial-header hidden text-[10px] tracking-[0.06em] sm:inline">
              INFO
            </span>
          </button>
        )}
      </div>

      {/* Chat Feed */}
      <div
        ref={chatContainerRef}
        className={clsx('chat-feed terminal-scrollbar', isVoiceMode && 'hidden md:block')}
      >
        {displayedMessages.length === 0 && (
          <div className="py-8 text-center sm:py-10">
            <span className="chat-feed-notice industrial-header">AWAITING_INITIAL_PAYLOADS</span>
          </div>
        )}

        <div className="chat-feed-stack">
          <AnimatePresence>
            {displayedMessages.map((message, index) => {
              const isWinningUserPrompt =
                message.type === 'user' && displayedMessages[index + 1]?.isSuccess === true
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  agent={agentForMessage}
                  senderProfile={null}
                  isWinningPrompt={isWinningUserPrompt}
                  successBannerLabel={PRACTICE_BREACH_BANNER_LABEL}
                  onShowJury={() => message.juryResponse && handleShowJury(message.juryResponse)}
                />
              )
            })}

            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] sm:h-8 sm:w-8">
                    <Image
                      src={generateAvatarUrl(sentinel.sentinel_id.toString())}
                      width={32}
                      height={32}
                      alt="sentinel"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="industrial-header text-[10px] text-[var(--color-text-muted)] sm:text-[11px]">
                    SENTINEL_PROCESSING...
                  </div>
                </div>
                <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-3 sm:p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                  <span className="font-mono text-xs tracking-normal text-[var(--color-text-muted)]">
                    Analyzing breach attempt...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      {isVoiceMode ? (
        <div className="min-h-0 flex-1 border-t border-[var(--color-border-strong)] md:min-h-[240px] md:flex-none md:shrink-0">
          <VoiceChatSurface
            agentName={sentinel.name || `Sentinel ${sentinel.sentinel_id}`}
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
        <div className="chat-composer">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
            <div className="border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
              <textarea
                ref={textareaRef}
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                className="chat-composer-input terminal-scrollbar"
                disabled={isSubmitting}
                placeholder="Craft your attack prompt here..."
                rows={1}
                style={{ overflow: 'hidden' }}
                autoComplete="off"
                spellCheck="false"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <div className="chat-composer-footer justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || promptInput.length === 0}
                  className="chat-submit-button button-ghost-terminal"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>EXECUTE</span>
                      <Zap className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {submitError && <p className="chat-error-banner">{submitError}</p>}
          </form>
        </div>
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
      className={clsx(
        'industrial-header flex items-center gap-1 px-2 py-1 text-[10px] tracking-wider transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px]',
        active
          ? 'bg-white text-black'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-white',
        disabled &&
          'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[var(--color-text-muted)]'
      )}
      aria-pressed={active}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
