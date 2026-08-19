'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, Zap, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { generateAvatarUrl } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from '@/components/agents/ChatInterface'
import { ChatMessage } from '@/components/agents/ChatMessage'
import { JuryResponseModal } from '@/components/agents/JuryResponseModal'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import { useAttackFeedMessages } from '@/hooks/practice/useAttackFeedMessages'
import { useAutoResizingTextarea } from '@/hooks/useAutoResizingTextarea'
import type { PracticeSentinelPublic } from '@/types/practice'

const PRACTICE_BREACH_BANNER_LABEL = 'SENTINEL_BREACHED // OBJECTIVE_COMPLETE'

interface PracticeChatInterfaceProps {
  sentinel: PracticeSentinelPublic
  attackerAddress: string
  onOpenSentinelInfo?: () => void
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

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useAutoResizingTextarea(promptInput)

  const { data: feed, refetch: refetchFeed } = usePracticeAttacksFeed(sentinel.sentinel_id, {
    mode: 'attack',
  })
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

  const { messages: chatMessages, isRoundIndexed } = useAttackFeedMessages(feed, pendingRound)

  useEffect(() => {
    if (pendingRound && isRoundIndexed) setPendingRound(null)
  }, [pendingRound, isRoundIndexed])

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isSubmitting])

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
    <div className="flex h-full flex-1 flex-col bg-[var(--color-bg-base)]">
      <JuryResponseModal
        isOpen={isJuryModalOpen}
        onClose={() => setIsJuryModalOpen(false)}
        response={selectedJuryResponse}
      />

      {/* Terminal-style Tabs */}
      <div className="chat-toolbar">
        <button
          onClick={() => setActiveTab('global')}
          className={clsx(
            'chat-toolbar-tab industrial-header',
            activeTab === 'global'
              ? 'border-white text-white'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
          )}
        >
          GLOBAL_ATTACKS
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
          MY_ATTACKS
        </button>
        {onOpenSentinelInfo && (
          <button
            type="button"
            onClick={onOpenSentinelInfo}
            className="chat-toolbar-action ml-auto"
            title="Sentinel info"
          >
            <Info className="h-3 w-3" />
            <span className="industrial-header text-[9px] tracking-widest">INFO</span>
          </button>
        )}
      </div>

      {/* Chat Feed */}
      <div ref={chatContainerRef} className="chat-feed terminal-scrollbar">
        {displayedMessages.length === 0 && (
          <div className="py-12 text-center">
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
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]">
                    <Image
                      src={generateAvatarUrl(sentinel.sentinel_id.toString())}
                      width={32}
                      height={32}
                      alt="sentinel"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
                    SENTINEL_PROCESSING...
                  </div>
                </div>
                <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-4 sm:p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                  <span className="font-mono text-xs uppercase text-[var(--color-text-muted)]">
                    Analyzing breach attempt...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {displayedMessages.length > 0 && !isSubmitting && (
          <div className="border-y border-[var(--color-border-strong)] py-6 text-center sm:py-8">
            <span className="chat-feed-notice industrial-header">AWAITING_NEW_PAYLOADS</span>
          </div>
        )}
      </div>

      {/* Input Area */}
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
    </div>
  )
}
