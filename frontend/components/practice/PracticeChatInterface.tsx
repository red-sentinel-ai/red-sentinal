'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, Zap, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { DEFAULT_PROFILE_URL } from '@/constants'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import type { ChatMessage as ChatMessageType } from '@/components/agents/ChatInterface'
import { ChatMessage } from '@/components/agents/ChatMessage'
import { JuryResponseModal } from '@/components/agents/JuryResponseModal'
import { usePracticeAttacksFeed } from '@/hooks/practice/usePracticeAttacksFeed'
import { useAttackPracticeSentinel } from '@/hooks/practice/useAttackPracticeSentinel'
import type { PracticeSentinelPublic } from '@/types/practice'

interface PracticeChatInterfaceProps {
  sentinel: PracticeSentinelPublic
  attackerAddress: string
  /** Mobile-only briefing toggle (the sidebar is hidden on small screens). */
  onToggleBriefing?: () => void
}

function toEpochMs(iso: string | null): string {
  if (!iso) return Date.now().toString()
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms.toString() : Date.now().toString()
}

export function PracticeChatInterface({
  sentinel,
  attackerAddress,
  onToggleBriefing,
}: PracticeChatInterfaceProps) {
  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessageType[] | null>(null)
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: feed, refetch: refetchFeed } = usePracticeAttacksFeed(sentinel.sentinel_id)
  const attackMutation = useAttackPracticeSentinel()
  const isSubmitting = attackMutation.isPending

  // ChatMessage is built for on-chain agents; practice only needs name/avatar/chain.
  const agentForMessage = useMemo(
    () =>
      ({
        agent_name: sentinel.name || `Sentinel ${sentinel.sentinel_id}`,
        agent_image: null,
        chain: 'sui',
      }) as unknown as AgentDetails,
    [sentinel]
  )

  // Source of truth: the polled public feed (newest-first → oldest-first for chat).
  const serverMessages = useMemo<ChatMessageType[]>(() => {
    const items = [...(feed?.messages ?? [])].reverse()
    const msgs: ChatMessageType[] = []
    for (const item of items) {
      const ts = toEpochMs(item.timestamp)
      msgs.push({
        id: `user-${item.id}`,
        type: 'user',
        content: item.content,
        timestamp: ts,
        sender: item.sender ?? undefined,
      })
      msgs.push({
        id: `agent-${item.id}`,
        type: 'agent',
        content: item.agent_response,
        timestamp: ts,
        isSuccess: item.success ?? undefined,
        score: item.score ?? undefined,
        juryResponse: item.jury_response ?? undefined,
      })
    }
    return msgs
  }, [feed])

  // Render server history plus any in-flight optimistic round, dropping the
  // optimistic round once the feed has caught up (matched by sender + content).
  const chatMessages = useMemo<ChatMessageType[]>(() => {
    if (!pendingRound) return serverMessages
    const optimisticUser = pendingRound[0]
    const indexed = serverMessages.some(
      m =>
        m.type === 'user' &&
        m.sender === optimisticUser.sender &&
        m.content === optimisticUser.content
    )
    return indexed ? serverMessages : [...serverMessages, ...pendingRound]
  }, [serverMessages, pendingRound])

  useEffect(() => {
    if (pendingRound && chatMessages === serverMessages) setPendingRound(null)
  }, [chatMessages, serverMessages, pendingRound])

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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = Math.min(window.innerHeight * 0.4, 300)
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [promptInput])

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
      <div className="flex h-12 shrink-0 items-center border-b border-[var(--color-border-strong)] px-6 lg:px-8">
        <button
          onClick={() => setActiveTab('global')}
          className={clsx(
            'industrial-header h-12 border-b-2 px-4 text-[11px] tracking-widest transition-colors',
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
            'industrial-header h-12 border-b-2 px-4 text-[11px] tracking-widest transition-colors',
            activeTab === 'mine'
              ? 'border-white text-white'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
          )}
        >
          MY_ATTACKS
        </button>
        {onToggleBriefing && (
          <button
            onClick={onToggleBriefing}
            className="ml-auto flex items-center gap-1.5 border border-[var(--color-border-strong)] px-2.5 py-1 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white lg:hidden"
            title="Sentinel briefing"
          >
            <Info className="h-3 w-3" />
            <span className="industrial-header text-[9px] tracking-widest">BRIEFING</span>
          </button>
        )}
      </div>

      {/* Chat Feed */}
      <div
        ref={chatContainerRef}
        className="terminal-scrollbar min-h-0 flex-1 space-y-10 overflow-y-auto p-6 lg:p-8"
      >
        {displayedMessages.length === 0 && (
          <div className="py-12 text-center">
            <span className="industrial-header text-[10px] tracking-[8px] text-[var(--color-text-muted)] opacity-40">
              AWAITING_INITIAL_PAYLOADS
            </span>
          </div>
        )}

        <div className="mx-auto max-w-4xl space-y-10">
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
                      src={DEFAULT_PROFILE_URL}
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
                <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-6">
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
          <div className="border-y border-[var(--color-border-strong)] py-8 text-center">
            <span className="industrial-header text-[10px] tracking-[8px] text-[var(--color-text-muted)] opacity-40">
              AWAITING_NEW_PAYLOADS
            </span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 py-3 lg:px-6 lg:py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
          <div className="border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
            <textarea
              ref={textareaRef}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              className="terminal-scrollbar placeholder:text-[var(--color-text-muted)]/30 min-h-[56px] w-full resize-none border-0 bg-[var(--color-bg-base)] px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-0"
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
            <div className="flex items-center justify-end border-t border-[var(--color-border-default)] px-3 py-2">
              <button
                type="submit"
                disabled={isSubmitting || promptInput.length === 0}
                className="button-ghost-terminal flex items-center gap-2 px-4 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-30"
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

          {submitError && (
            <div className="border-[var(--color-danger)]/30 border bg-[var(--color-danger-muted)] px-3 py-2">
              <span className="font-mono text-[11px] uppercase text-[var(--color-danger)]">
                {submitError}
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
