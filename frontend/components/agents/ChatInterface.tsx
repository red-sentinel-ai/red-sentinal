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
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const account = useCurrentAccount()
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()

  const senderAddresses = useMemo(() => {
    const addresses = chatMessages
      .filter((msg) => msg.type === 'user' && msg.sender)
      .map((msg) => msg.sender!)
    return [...new Set(addresses)]
  }, [chatMessages])

  const { data: userProfilesMap } = useUserProfiles(senderAddresses)

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const isAgentDrained = chatMessages.some(
    (message) => message.type === 'agent' && message.isSuccess === true
  )

  const winnerInfo = useMemo(() => {
    const winningAgentMessageIndex = chatMessages.findIndex(
      (msg) => msg.type === 'agent' && msg.isSuccess === true
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
        })
      })

    setChatMessages(initialMessages)
  }, [agentEvents])

  useEffect(() => {
    if (apiResponse) {
      const newAgentMessage: ChatMessage = {
        id: `agent-new-${Date.now()}`,
        type: 'agent',
        content: apiResponse.response.data.explanation,
        timestamp: Date.now().toString(),
        isSuccess: apiResponse.response.data.success,
        score: apiResponse.response.data.score,
      }
      setChatMessages((prevMessages) => [...prevMessages, newAgentMessage])
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

    setChatMessages((prevMessages) => [...prevMessages, newUserMessage])
    await onSendMessage(promptInput)
    setPromptInput('')
  }

  return (
    <div className="flex flex-col h-full flex-1 text-black justify-between pb-6">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-210px)]"
      >
        {chatMessages.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <Image
              src="/icons/exclamation.png"
              width={60}
              height={60}
              alt="exclamation"
              className="mx-auto mb-4 opacity-70"
            />
            <p className="text-base sm:text-lg">No messages yet. Start attacking the agent!</p>
            <p className="text-xs sm:text-sm mt-2 opacity-75 px-4">
              Try to break through their defenses with clever prompts.
            </p>
          </div>
        )}

        <AnimatePresence>
          {chatMessages.map((message, index) => {
            const isWinningUserPrompt =
              message.type === 'user' && chatMessages[index + 1]?.isSuccess === true
            return (
              <ChatMessage
                key={message.id}
                message={message}
                agent={agent}
                senderProfile={userProfilesMap?.[message.sender!] || null}
                isWinningPrompt={isWinningUserPrompt}
              />
            )
          })}

          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] sm:max-w-[75%] flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-gray-300">
                  <Image
                    src={agent.agent_profile || DEFAULT_PROFILE_URL}
                    width={32}
                    height={32}
                    alt="agent"
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div className="border border-gray-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 bg-gray-50">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-600" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    Agent is analyzing your attack...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAgentDrained ? (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center w-full">
            <h3 className="text-lg font-bold text-red-600">This Sentinel is Drained</h3>
            <p className="text-xs text-gray-500 mb-2">
              The sentinel has been successfully defeated.
            </p>

            {winnerInfo && (
              <div className="bg-white border border-gray-200 rounded-lg mx-auto px-3">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:divide-x sm:divide-gray-200 gap-y-2 sm:gap-y-0">
                  <div className="flex items-baseline gap-x-2 px-3 w-full sm:w-auto justify-center">
                    <p className="text-xs font-semibold text-gray-600 shrink-0">Winner:</p>

                    <Link
                      href={`/u/${winnerInfo.winnerAddress}`}
                      className="text-right underline text-sm text-blue-600"
                    >
                      {formatAddress(winnerInfo.winnerAddress as string)}
                    </Link>
                  </div>

                  <div className="flex items-baseline gap-x-2 px-3 w-full sm:w-auto justify-center">
                    <p className="text-xs font-semibold text-gray-600 shrink-0">Amount:</p>
                    <p className="text-base font-bold text-green-600">{winnerInfo.wonAmount} SUI</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="relative">
              <div className="relative w-full border border-gray-300 rounded-2xl bg-white focus-within:ring-1 focus-within:ring-black transition-all duration-200 z-10 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={promptInput}
                  onChange={(e) => {
                    setPromptInput(e.target.value)
                    countTokens(e.target.value)
                  }}
                  className="w-full p-3 sm:p-4 min-h-[50px] sm:min-h-[60px] text-sm sm:text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 resize-none text-black"
                  disabled={isSubmitting}
                  placeholder="Craft your attack prompt..."
                  rows={1}
                  style={{ overflow: 'hidden' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />

                <div className="flex items-center justify-between px-3 pb-2 sm:px-4 sm:pb-3 bg-white">
                  <div
                    className={clsx(
                      'text-xs bg-[#D9D9D9] px-2 py-1 rounded',
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
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-black rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:bg-gray-800"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Image
                        src="/icons/top-arrow.svg"
                        width={24}
                        height={24}
                        alt="top arrow"
                        className="filter invert"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-[12px] bg-[#F49BEE]/90 blur-[4px] absolute sm:min-h-[120px] w-[100%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>
            </div>

            {submitError && (
              <div className="mt-2 text-red-600 text-xs sm:text-sm bg-red-100 border border-red-200 rounded-lg p-2 relative z-10">
                {submitError}
              </div>
            )}
            {tokenCount > ATTACK_PROMPT_MAX_TOKENS && (
              <div className="mt-2 text-red-600 text-xs sm:text-sm bg-red-100 border border-red-200 rounded-lg p-2 relative z-10">
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
