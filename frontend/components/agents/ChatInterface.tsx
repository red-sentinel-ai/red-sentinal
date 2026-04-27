'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'

import { ATTACK_PROMPT_MAX_TOKENS, DEFAULT_PROFILE_URL } from '@/constants'
import type { SupportedChain } from '@/constants/chains'
import { truncateAddress } from '@/lib/utils'
import type { ConsumePromptApiResponse } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ChatEvent } from '@/hooks/agents/useAgentChatHistory'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useTokenCount } from '@/hooks/useTokenCount'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { ChainMismatchBanner } from '@/components/ui/common/ChainMismatchBanner'
import { ChatMessage } from './ChatMessage'
import { JuryResponseModal } from './JuryResponseModal'

export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: string
  isSuccess?: boolean
  score?: number
  txDigest?: string
  amountWon?: string
  winner?: string
  sender?: string
  amountSent?: string
  juryResponse?: string
}

interface ChatInterfaceProps {
  agent: AgentDetails
  chatEvents: ChatEvent[]
  eventsLoading?: boolean
  apiResponse: ConsumePromptApiResponse | null
  onSendMessage: (prompt: string) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  refetchAgent: () => void
  chainMismatch?: SupportedChain | null
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
}: ChatInterfaceProps) {
  const [promptInput, setPromptInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { address: connectedAddress } = useConnectedAddress()
  const suiAccount = useCurrentAccount()
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()

  const [isAttackPaused, setIsAttackPaused] = useState(false)

  useEffect(() => {
    const unlock = Number(agent.unlock_timestamp)

    if (!unlock || unlock === 0) {
      setIsAttackPaused(false)
      return
    }

    const check = () => {
      const locked = Date.now() < unlock
      setIsAttackPaused(!locked)
      return locked
    }

    if (check()) {
      const interval = setInterval(() => {
        if (!check()) clearInterval(interval)
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [agent.unlock_timestamp])

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

  const isAgentDrained = chatMessages.some(
    message => message.type === 'agent' && message.isSuccess === true
  )

  const winnerInfo = useMemo(() => {
    const winningAgentMessageIndex = chatMessages.findIndex(
      msg => msg.type === 'agent' && msg.isSuccess === true
    )

    if (winningAgentMessageIndex > 0) {
      const correspondingUserMessage = chatMessages[winningAgentMessageIndex - 1]

      if (correspondingUserMessage?.type === 'user') {
        return {
          winnerAddress: correspondingUserMessage.sender,
          wonAmount: correspondingUserMessage.amountSent,
        }
      }
    }

    return null
  }, [chatMessages])

  const displayedMessages = useMemo(() => {
    if (activeTab === 'global') return chatMessages
    if (!connectedAddress) return []
    const filtered: ChatMessage[] = []
    for (let i = 0; i < chatMessages.length; i++) {
      const msg = chatMessages[i]
      if (msg.type === 'user' && msg.sender === connectedAddress) {
        filtered.push(msg)
        if (chatMessages[i + 1]?.type === 'agent') {
          filtered.push(chatMessages[i + 1])
          i++
        }
      }
    }
    return filtered
  }, [chatMessages, activeTab, connectedAddress])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      // Cap height at 300px or 40vh, whichever is smaller
      const maxHeight = Math.min(window.innerHeight * 0.4, 300)
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [promptInput])

  useEffect(() => {
    const initialMessages: ChatMessage[] = []
    for (const event of chatEvents) {
      if (event.type === 'prompt') {
        initialMessages.push({
          id: `user-${event.id}`,
          type: 'user',
          content: event.content,
          timestamp: event.timestamp,
          sender: event.sender,
          amountSent: event.amount_sent
            ? (Number(event.amount_sent) / 1_000_000_000).toFixed(2)
            : undefined,
        })
        initialMessages.push({
          id: `agent-${event.id}`,
          type: 'agent',
          content: event.agent_response,
          timestamp: event.timestamp,
          isSuccess: event.success,
          score: event.score,
          txDigest: event.tx_digest,
          juryResponse: event.jury_response ?? undefined,
        })
      }
    }
    setChatMessages(initialMessages)
  }, [chatEvents])

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
      setChatMessages(prevMessages => [...prevMessages, newAgentMessage])
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
      // ConnectModal is Sui-specific; only trigger it when Sui is the active chain
      if (!suiAccount?.address) {
        setIsWalletModalOpen(true)
        return
      }
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

    setChatMessages(prevMessages => [...prevMessages, newUserMessage])
    await onSendMessage(promptInput)
    setPromptInput('')
  }

  return (
    <div className="flex h-full flex-1 flex-col justify-between pb-2 text-[var(--color-text-primary)] sm:pb-6">
      <JuryResponseModal
        isOpen={isJuryModalOpen}
        onClose={() => setIsJuryModalOpen(false)}
        response={selectedJuryResponse}
      />

      <div className="px-3 pb-1 pt-1 sm:px-6 sm:py-2">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'global' | 'mine')}>
          <TabsList className="h-auto rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-[2px]">
            <TabsTrigger
              value="global"
              className="rounded-md border-b-0 py-1 data-[state=active]:border-b-0 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:shadow-sm sm:px-4"
            >
              Global Chat
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="rounded-md border-b-0 py-1 data-[state=active]:border-b-0 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:shadow-sm sm:px-4"
            >
              My Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        ref={chatContainerRef}
        className="ios-scroll max-h-[calc(100vh-160px)] flex-1 space-y-2 overflow-y-auto p-2 pt-1 sm:max-h-[calc(100vh-210px)] sm:space-y-6 sm:p-6"
      >
        {displayedMessages.length === 0 && !eventsLoading && (
          <div className="py-6 text-center text-[var(--color-text-muted)] sm:py-12">
            <Image
              src="/icons/exclamation.png"
              width={60}
              height={60}
              alt="exclamation"
              className="mx-auto mb-4 opacity-70"
            />
            {activeTab === 'mine' ? (
              <>
                <p className="text-base sm:text-lg">
                  {connectedAddress
                    ? "You haven't attacked yet."
                    : 'Connect your wallet to see your chats.'}
                </p>
                <p className="mt-2 px-4 text-xs opacity-75 sm:text-sm">
                  {connectedAddress
                    ? 'Submit a prompt to start your attack!'
                    : 'Your messages will appear here once connected.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-base sm:text-lg">No messages yet. Start attacking the agent!</p>
                <p className="mt-2 px-4 text-xs opacity-75 sm:text-sm">
                  Try to break through their defenses with clever prompts.
                </p>
              </>
            )}
          </div>
        )}

        <AnimatePresence>
          {displayedMessages.map((message, index) => {
            const isWinningUserPrompt =
              message.type === 'user' && displayedMessages[index + 1]?.isSuccess === true
            return (
              <ChatMessage
                key={message.id}
                message={message}
                agent={agent}
                senderProfile={userProfilesMap?.[message.sender!] || null}
                isWinningPrompt={isWinningUserPrompt}
                onShowJury={() => message.juryResponse && handleShowJury(message.juryResponse)}
              />
            )
          })}

          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] items-start gap-2 sm:max-w-[75%] sm:gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-300 sm:h-10 sm:w-10">
                  <Image
                    src={agent.agent_image || DEFAULT_PROFILE_URL}
                    width={32}
                    height={32}
                    alt="agent"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3 sm:p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-secondary)] sm:h-5 sm:w-5" />
                  <span className="text-xs text-[var(--color-text-secondary)] sm:text-sm">
                    Agent is analyzing your attack...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {chainMismatch ? (
        <ChainMismatchBanner agentChain={chainMismatch} />
      ) : isAttackPaused ? (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-4">
          <div className="w-full text-center">
            <h3 className="text-lg font-bold text-[var(--color-warning)]">Attacks Paused</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              The owner&apos;s lock period has expired and they can currently withdraw funds. Attacks
              will resume once the sentinel is re-funded.
            </p>
          </div>
        </div>
      ) : isAgentDrained ? (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
          <div className="w-full text-center">
            <h3 className="text-lg font-bold text-[var(--color-danger)]">This Sentinel is Drained</h3>
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">
              The sentinel has been successfully defeated.
            </p>

            {winnerInfo && (
              <div className="mx-auto rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3">
                <div className="flex flex-col items-center justify-center gap-y-2 sm:flex-row sm:gap-y-0 sm:divide-x sm:divide-[var(--color-border-subtle)]">
                  <div className="flex w-full items-baseline justify-center gap-x-2 px-3 sm:w-auto">
                    <p className="shrink-0 text-xs font-semibold text-[var(--color-text-secondary)]">Winner:</p>

                    <Link
                      href={`/u/${winnerInfo.winnerAddress}`}
                      className="text-right text-sm text-[var(--color-info)] underline"
                    >
                      {truncateAddress(winnerInfo.winnerAddress as string)}
                    </Link>
                  </div>

                  <div className="flex w-full items-baseline justify-center gap-x-2 px-3 sm:w-auto">
                    <p className="shrink-0 text-xs font-semibold text-[var(--color-text-secondary)]">Amount:</p>
                    <p className="text-base font-bold text-[var(--color-success)]">{winnerInfo.wonAmount} SUI</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              {/* Premium mobile-like chat input container */}
              <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-lg transition-all duration-200 focus-within:border-[var(--color-border-default)] focus-within:shadow-xl sm:rounded-2xl sm:border-[var(--color-border-default)]">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={promptInput}
                    onChange={e => {
                      setPromptInput(e.target.value)
                      countTokens(e.target.value)
                    }}
                    className="min-h-[80px] w-full resize-none border-none bg-transparent p-3 pb-9 pr-12 text-[15px] leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:ring-0 sm:min-h-[100px] sm:p-4 sm:pb-10 sm:pr-14 sm:text-base"
                    disabled={isSubmitting}
                    placeholder="Craft your attack prompt..."
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

                  {/* Token count - bottom right corner */}
                  <div
                    className={clsx(
                      'absolute bottom-2 right-16 text-[10px] font-medium tracking-wide sm:bottom-3 sm:right-[72px]',
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
                    )}
                  >
                    <span className={clsx({ 'animate-pulse': isTokenCountDebouncing })}>
                      {tokenCount}/{ATTACK_PROMPT_MAX_TOKENS}
                    </span>
                  </div>

                  {/* Desktop: Circular send button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      promptInput.length === 0 ||
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS
                    }
                    className="absolute bottom-3 right-3 hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-surface)] shadow-md transition-all duration-200 hover:scale-105 hover:bg-[var(--color-text-secondary)] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:flex"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Image
                        src="/icons/top-arrow.svg"
                        width={22}
                        height={22}
                        alt="send"
                        className="invert filter"
                      />
                    )}
                  </button>

                  {/* Mobile: Floating send button */}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      promptInput.length === 0 ||
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS
                    }
                    className="absolute bottom-2 right-2 flex h-10 w-10 touch-manipulation items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-surface)] shadow-md transition-all duration-200 hover:bg-[var(--color-text-secondary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Image
                        src="/icons/top-arrow.svg"
                        width={18}
                        height={18}
                        alt="send"
                        className="invert filter"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Premium gradient glow effect */}
              <div className="pointer-events-none absolute -inset-1 z-0 rounded-[20px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 opacity-60 blur-lg transition-opacity duration-300 group-focus-within:opacity-100 sm:rounded-[16px]"></div>
              <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-[#F49BEE]/80 blur-md sm:min-h-[100px]"></div>
            </div>

            {submitError && (
              <div className="relative z-10 mt-2 rounded-lg border border-red-200 bg-red-100 p-2 text-xs text-red-600 sm:text-sm">
                {submitError}
              </div>
            )}
            {tokenCount > ATTACK_PROMPT_MAX_TOKENS && (
              <div className="relative z-10 mt-2 rounded-lg border border-red-200 bg-red-100 p-2 text-xs text-red-600 sm:text-sm">
                Your prompt exceeds the token limit.
              </div>
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
