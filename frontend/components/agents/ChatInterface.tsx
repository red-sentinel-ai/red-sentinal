'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, Zap, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectModal } from '@mysten/dapp-kit'

import { ATTACK_PROMPT_MAX_TOKENS } from '@/constants'
import { getTokenForCoinType } from '@/constants/tokens'
import { generateAvatarUrl } from '@/lib/utils'
import type { SupportedChain } from '@/constants/chains'
import { truncateAddress } from '@/lib/utils'
import type { ConsumePromptApiResponse } from '@/types'
import type { ChatEvent } from '@/hooks/agents/useAgentChatHistory'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useAutoResizingTextarea } from '@/hooks/useAutoResizingTextarea'
import type { Agent } from '@/types/agents'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { ChainMismatchBanner } from '@/components/ui/common/ChainMismatchBanner'
import { SentinelVoiceCallButton } from '@/components/sentinel-voice/SentinelVoiceCallButton'
import { useFocusMode } from '@/context/FocusModeContext'
import { ChatMessage } from './ChatMessage'
import { JuryResponseModal } from './JuryResponseModal'
import { TokenAmount } from '@/components/ui/common/TokenAmount'

export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: string
  isSuccess?: boolean
  score?: number
  txDigest?: string
  walrusBlobId?: string
  amountWon?: string
  winner?: string
  sender?: string
  amountSent?: string
  juryResponse?: string
}

interface ChatInterfaceProps {
  agent: Agent
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

export default function ChatInterface({
  agent,
  chatEvents,
  eventsLoading,
  apiResponse,
  onSendMessage,
  isSubmitting,
  submitError,
  refetchAgent,
  chainMismatch,
  onStartVoiceCall,
}: ChatInterfaceProps) {
  const [promptInput, setPromptInput] = useState('')
  const [pendingRound, setPendingRound] = useState<ChatMessage[] | null>(null)
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useAutoResizingTextarea(promptInput)
  const { address: connectedAddress } = useConnectedAddress()
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()
  const { isFocusMode, enableFocusMode } = useFocusMode()

  const [isAttackPaused, setIsAttackPaused] = useState(false)

  const agentToken = getTokenForCoinType(agent.coin_type, agent.chain)

  useEffect(() => {
    setIsAttackPaused(Number(agent.unlock_timestamp) < Date.now())
  }, [agent.unlock_timestamp])

  // Source of truth: the indexed on-chain chat history.
  const serverMessages = useMemo<ChatMessage[]>(() => {
    const msgs: ChatMessage[] = []
    for (const event of chatEvents) {
      if (event.type !== 'prompt') continue
      msgs.push({
        id: `user-${event.id}`,
        type: 'user',
        content: event.content,
        timestamp: event.timestamp,
        sender: event.sender,
        amountSent: event.amount_sent ?? undefined,
      })
      msgs.push({
        id: `agent-${event.id}`,
        type: 'agent',
        content: event.agent_response,
        timestamp: event.timestamp,
        isSuccess: event.success,
        score: event.score,
        txDigest: event.tx_digest,
        walrusBlobId: event.walrus_blob_id ?? undefined,
        juryResponse: event.jury_response ?? undefined,
      })
    }
    return msgs
  }, [chatEvents])

  // Render the server history plus any in-flight optimistic round, dropping the
  // optimistic round once the indexer has caught up with it (matched by
  // sender + content so concurrent attacks in the global feed can't clear it early).
  const chatMessages = useMemo<ChatMessage[]>(() => {
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

  // Once the server round is in, discard the now-stale optimistic copy.
  useEffect(() => {
    if (pendingRound && chatMessages === serverMessages) setPendingRound(null)
  }, [chatMessages, serverMessages, pendingRound])

  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false)
  const [selectedJuryResponse, setSelectedJuryResponse] = useState('')

  const handleShowJury = (response: string) => {
    setSelectedJuryResponse(response)
    setIsJuryModalOpen(true)
  }

  const senderAddresses = useMemo(() => {
    const addresses = chatMessages
      .filter(msg => msg.type === 'user' && msg.sender)
      .map(msg => msg.sender!)
    return [...new Set(addresses)]
  }, [chatMessages])

  const { data: userProfilesMap } = useUserProfiles(senderAddresses)

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const breachIndex = useMemo(
    () => chatMessages.findIndex(msg => msg.type === 'agent' && msg.isSuccess === true),
    [chatMessages]
  )

  const isAgentDrained = breachIndex >= 0

  const orderedMessages = useMemo(
    () => (breachIndex >= 0 ? chatMessages.slice(0, breachIndex + 1) : chatMessages),
    [chatMessages, breachIndex]
  )

  const winnerInfo = useMemo(() => {
    if (breachIndex > 0) {
      const correspondingUserMessage = chatMessages[breachIndex - 1]

      if (correspondingUserMessage?.type === 'user') {
        return {
          winnerAddress: correspondingUserMessage.sender,
          wonAmount: correspondingUserMessage.amountSent,
        }
      }
    }

    return null
  }, [chatMessages, breachIndex])

  const displayedMessages = useMemo(() => {
    if (activeTab === 'global') return orderedMessages
    if (!connectedAddress) return []
    const filtered: ChatMessage[] = []
    for (let i = 0; i < orderedMessages.length; i++) {
      const msg = orderedMessages[i]
      if (msg.type === 'user' && msg.sender === connectedAddress) {
        filtered.push(msg)
        if (orderedMessages[i + 1]?.type === 'agent') {
          filtered.push(orderedMessages[i + 1])
          i++
        }
      }
    }
    return filtered
  }, [orderedMessages, activeTab, connectedAddress])

  useEffect(() => {
    if (apiResponse) {
      const newAgentMessage: ChatMessage = {
        id: `agent-new-${Date.now()}`,
        type: 'agent',
        content: apiResponse.response.data.agent_response,
        timestamp: Date.now().toString(),
        isSuccess: apiResponse.response.data.success,
        score: apiResponse.response.data.score,
        juryResponse: apiResponse.response.data.jury_response,
      }
      setPendingRound(prev => (prev ? [...prev, newAgentMessage] : [newAgentMessage]))
      refetchAgent()
    }
  }, [apiResponse, refetchAgent])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connectedAddress) {
        setIsWalletModalOpen(true)
        return
    }

    if (tokenCount > ATTACK_PROMPT_MAX_TOKENS) {
      return
    }

    if (!promptInput.trim() || isSubmitting) return

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: promptInput,
      timestamp: Date.now().toString(),
      sender: connectedAddress,
    }

    setPendingRound([newUserMessage])
    await onSendMessage(promptInput)
    setPromptInput('')
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
        {!isFocusMode && (
          <button
            onClick={enableFocusMode}
            className="chat-toolbar-action ml-auto"
            title="Enter focus mode"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="industrial-header text-[9px] tracking-widest">FOCUS</span>
          </button>
        )}
      </div>

      {/* Chat Feed */}
      <div ref={chatContainerRef} className="chat-feed terminal-scrollbar">
        {displayedMessages.length === 0 && !eventsLoading && (
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
                  agent={agent}
                  senderProfile={userProfilesMap?.[message.sender?.toLowerCase()] || null}
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
                      src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
                      width={32}
                      height={32}
                      alt="agent"
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

        {/* Awaiting Status */}
        {displayedMessages.length > 0 && !isSubmitting && !isAgentDrained && (
          <div className="border-y border-[var(--color-border-strong)] py-6 text-center sm:py-8">
            <span className="chat-feed-notice industrial-header">AWAITING_NEW_PAYLOADS</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      {chainMismatch ? (
        <ChainMismatchBanner agentChain={chainMismatch} />
      ) : isAttackPaused && !isAgentDrained ? (
        <div className="shrink-0 border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] p-4 sm:p-6">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="industrial-header text-accent text-sm">ATTACKS_PAUSED</h3>
            <p className="mt-2 font-mono text-[11px] uppercase text-[var(--color-text-muted)]">
              The owner&apos;s lock period has expired. Attacks will resume once the sentinel is
              re-funded.
            </p>
          </div>
        </div>
      ) : isAgentDrained ? (
        <div className="shrink-0 border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] p-4 sm:p-6">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="industrial-header text-sm text-[var(--color-danger)]">
              SENTINEL_COMPROMISED
            </h3>
            <p className="mt-2 font-mono text-[11px] uppercase text-[var(--color-text-muted)]">
              This sentinel has been successfully defeated.
            </p>

            {winnerInfo && (
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-4 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3 sm:gap-6 sm:px-6">
                <div className="text-left">
                  <span className="industrial-header block text-[9px] text-[var(--color-text-muted)]">
                    WINNER
                  </span>
                  <Link
                    href={`/u/${winnerInfo.winnerAddress}`}
                    className="industrial-header text-accent text-[11px] transition-opacity hover:opacity-70"
                  >
                    {truncateAddress(winnerInfo.winnerAddress as string)}
                  </Link>
                </div>
                <div className="text-left">
                  <span className="industrial-header block text-[9px] text-[var(--color-text-muted)]">
                    AMOUNT_WON
                  </span>
                  {winnerInfo.wonAmount && (
                    <TokenAmount
                      rawAmount={winnerInfo.wonAmount}
                      token={agentToken}
                      precision={4}
                      iconSize={12}
                      className="industrial-header text-[11px] text-[var(--color-success)]"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="chat-composer">
          <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-2">
            <div className="border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
              <textarea
                ref={textareaRef}
                value={promptInput}
                onChange={e => {
                  setPromptInput(e.target.value)
                  countTokens(e.target.value)
                }}
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
              <div className="chat-composer-footer justify-between">
                <div className="industrial-header text-[var(--color-text-muted)]/50 flex items-center gap-2 text-[9px] tracking-widest">
                  FEE:{' '}
                  <span className="text-[var(--color-text-muted)]">
                    <TokenAmount
                      rawAmount={agent.current_cost_per_message ?? agent.cost_per_message}
                      token={agentToken}
                      precision={4}
                      iconSize={10}
                    />
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={clsx(
                      'industrial-header text-[9px] tabular-nums tracking-widest',
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS
                        ? 'text-[var(--color-danger)]'
                        : 'text-[var(--color-text-muted)]/40'
                    )}
                  >
                    <span className={clsx({ 'animate-pulse': isTokenCountDebouncing })}>
                      {tokenCount}/{ATTACK_PROMPT_MAX_TOKENS}
                    </span>
                  </span>
                  {/* This branch only renders while the sentinel is attackable,
                      so a paused or wrong-chain sentinel never reaches here. */}
                  <SentinelVoiceCallButton onClick={onStartVoiceCall} disabled={isSubmitting} />
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      promptInput.length === 0 ||
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS
                    }
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
            </div>

            {submitError && <p className="chat-error-banner">{submitError}</p>}

            {tokenCount > ATTACK_PROMPT_MAX_TOKENS && (
              <p className="chat-error-banner">TOKEN_LIMIT_EXCEEDED</p>
            )}
          </form>
        </div>
      )}

      <ConnectModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        trigger={<span className="hidden" />}
      />
    </div>
  )
}
