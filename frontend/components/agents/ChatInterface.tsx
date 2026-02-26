'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatAddress } from '@mysten/sui/utils'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'

import { ATTACK_PROMPT_MAX_TOKENS, DEFAULT_PROFILE_URL } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import type { AgentEvents } from '@/hooks/useAgentEvents'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { ChatMessage } from './ChatMessage'
import { useTokenCount } from '@/hooks/useTokenCount'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { JuryResponseModal } from './JuryResponseModal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  agentEvents: AgentEvents
  apiResponse: ConsumePromptApiResponse | null
  onSendMessage: (prompt: string) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  refetchAgent: () => void
}

export default function ChatInterface({
  agent,
  agentEvents,
  apiResponse,
  onSendMessage,
  isSubmitting,
  submitError,
  refetchAgent,
}: ChatInterfaceProps) {
  const [promptInput, setPromptInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const account = useCurrentAccount()
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()

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
    if (!account?.address) return []
    const filtered: ChatMessage[] = []
    for (let i = 0; i < chatMessages.length; i++) {
      const msg = chatMessages[i]
      if (msg.type === 'user' && msg.sender === account.address) {
        filtered.push(msg)
        if (chatMessages[i + 1]?.type === 'agent') {
          filtered.push(chatMessages[i + 1])
          i++
        }
      }
    }
    return filtered
  }, [chatMessages, activeTab, account?.address])

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
    agentEvents.promptConsumed
      .sort((a, b) => Number.parseInt(a.timestampMs) - Number.parseInt(b.timestampMs))
      .forEach((event, index) => {
        initialMessages.push({
          id: `user-hist-${event.id.txDigest}-${index}`,
          type: 'user',
          content: event.parsedJson.message,
          timestamp: event.timestampMs,
          sender: event.parsedJson.sender,
          amountSent: event.parsedJson.amount
            ? (Number.parseInt(event.parsedJson.amount) / 1000000000).toFixed(2)
            : undefined,
        })
        initialMessages.push({
          id: `agent-hist-${event.id.txDigest}-${index}`,
          type: 'agent',
          content: event.parsedJson.agent_response,
          timestamp: event.timestampMs,
          isSuccess: event.parsedJson.success,
          score: event.parsedJson.score,
          txDigest: event.id.txDigest,
          juryResponse: event.parsedJson.jury_response,
        })
      })

    setChatMessages(initialMessages)
  }, [agentEvents])

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

    if (!account?.address) {
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
      sender: account?.address,
    }

    setChatMessages(prevMessages => [...prevMessages, newUserMessage])
    await onSendMessage(promptInput)
    setPromptInput('')
  }

  return (
    <div className="flex h-full flex-1 flex-col justify-between pb-6 text-black">
      <JuryResponseModal
        isOpen={isJuryModalOpen}
        onClose={() => setIsJuryModalOpen(false)}
        response={selectedJuryResponse}
      />

      <div className="px-3 py-2 sm:px-6">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'global' | 'mine')}>
          <TabsList className="h-auto rounded-lg border border-gray-200 bg-gray-100 p-1">
            <TabsTrigger
              value="global"
              className="rounded-md border-b-0 px-4 py-1.5 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Global Chat
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="rounded-md border-b-0 px-4 py-1.5 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              My Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div
        ref={chatContainerRef}
        className="max-h-[calc(100vh-210px)] flex-1 space-y-4 overflow-y-auto p-3 sm:space-y-6 sm:p-6"
      >
        {displayedMessages.length === 0 && (
          <div className="py-8 text-center text-gray-500 sm:py-12">
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
                  {account?.address ? "You haven't attacked yet." : 'Connect your wallet to see your chats.'}
                </p>
                <p className="mt-2 px-4 text-xs opacity-75 sm:text-sm">
                  {account?.address
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
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600 sm:h-5 sm:w-5" />
                  <span className="text-xs text-gray-700 sm:text-sm">
                    Agent is analyzing your attack...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAgentDrained ? (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="w-full text-center">
            <h3 className="text-lg font-bold text-red-600">This Sentinel is Drained</h3>
            <p className="mb-2 text-xs text-gray-500">
              The sentinel has been successfully defeated.
            </p>

            {winnerInfo && (
              <div className="mx-auto rounded-lg border border-gray-200 bg-white px-3">
                <div className="flex flex-col items-center justify-center gap-y-2 sm:flex-row sm:gap-y-0 sm:divide-x sm:divide-gray-200">
                  <div className="flex w-full items-baseline justify-center gap-x-2 px-3 sm:w-auto">
                    <p className="shrink-0 text-xs font-semibold text-gray-600">Winner:</p>

                    <Link
                      href={`/u/${winnerInfo.winnerAddress}`}
                      className="text-right text-sm text-blue-600 underline"
                    >
                      {formatAddress(winnerInfo.winnerAddress as string)}
                    </Link>
                  </div>

                  <div className="flex w-full items-baseline justify-center gap-x-2 px-3 sm:w-auto">
                    <p className="shrink-0 text-xs font-semibold text-gray-600">Amount:</p>
                    <p className="text-base font-bold text-green-600">{winnerInfo.wonAmount} SUI</p>
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
              <div className="relative z-10 w-full overflow-hidden rounded-2xl border border-gray-300 bg-white transition-all duration-200 focus-within:ring-1 focus-within:ring-black">
                <textarea
                  ref={textareaRef}
                  value={promptInput}
                  onChange={e => {
                    setPromptInput(e.target.value)
                    countTokens(e.target.value)
                  }}
                  className="min-h-[50px] w-full resize-none border-none bg-transparent p-3 text-sm text-black outline-none placeholder:text-gray-400 focus:ring-0 sm:min-h-[60px] sm:p-4 sm:text-base"
                  disabled={isSubmitting}
                  placeholder="Craft your attack prompt..."
                  rows={1}
                  style={{ overflow: 'hidden' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />

                <div className="flex items-center justify-between bg-white px-3 pb-2 sm:px-4 sm:pb-3">
                  <div
                    className={clsx(
                      'rounded bg-[#D9D9D9] px-2 py-1 text-xs',
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS ? 'text-red-500' : 'text-black'
                    )}
                  >
                    <span className={clsx({ 'animate-pulse': isTokenCountDebouncing })}>
                      Tokens: {tokenCount} / {ATTACK_PROMPT_MAX_TOKENS}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      promptInput.length === 0 ||
                      tokenCount > ATTACK_PROMPT_MAX_TOKENS
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                    ) : (
                      <Image
                        src="/icons/top-arrow.svg"
                        width={24}
                        height={24}
                        alt="top arrow"
                        className="invert filter"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-[12px] bg-[#F49BEE]/90 blur-[4px] sm:min-h-[120px]"></div>
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
