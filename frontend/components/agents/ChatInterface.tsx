'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, AlertCircle, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatAddress } from '@mysten/sui/utils'
import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'

import { AgentInfo } from '@/components/AgentInfo'
import { ATTACK_PROMPT_MAX_TOKENS, DEFAULT_PROFILE_URL, EXPLORER_BASE_URL } from '@/constants'
import type { ConsumePromptApiResponse } from '@/types'
import type { AgentEvents } from '@/hooks/useAgentEvents'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { ChatMessage } from './ChatMessage'
import { useTokenCount } from '@/hooks/useTokenCount'

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
  const [showAgentDetails, setShowAgentDetails] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const account = useCurrentAccount()
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()

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
    <div className="flex flex-col text-[#E5E7EB] h-full flex-1">
      <div className="backdrop-blur-xl border-b border-[#2E40494D] p-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#558EB4] ring-opacity-50">
                <Image
                  src={agent.agent_profile || DEFAULT_PROFILE_URL}
                  alt={`${agent.agent_name} profile`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                    Target: {agent.agent_name}
                  </h1>
                  {agent.is_featured && (
                    <Image
                      src="/icons/check-mark.svg"
                      width={20}
                      height={20}
                      alt="checkmark"
                      className="flex-shrink-0"
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-300 truncate">
                  Sentinel ID: {agent.agent_id}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAgentDetails(!showAgentDetails)}
              className="p-2 hover:bg-[#2E40494D] rounded-md transition-colors flex items-center gap-1 mt1"
            >
              <p className="text-xs sm:text-sm font-semibold underline"> View System Prompt</p>
              {showAgentDetails ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>

          <div className="flex-1 sm:flex-none">
            <AgentInfo
              balance={agent.balance.toString()}
              decimal={9}
              promptPrice={agent.cost_per_message.toString()}
              symbol="SUI"
              className="w-full sm:w-auto text-xs sm:text-sm"
              breakAttempts={0}
              isDrained={isAgentDrained}
              drainAmount="0"
            />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showAgentDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-black/40 p-3 sm:p-4 rounded-lg border border-gray-700">
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {agent.system_prompt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-270px)] backdrop-blur-md"
      >
        {chatMessages.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-400">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
            </div>
            <p className="text-base sm:text-lg">No messages yet. Start attacking the agent!</p>
            <p className="text-xs sm:text-sm mt-2 opacity-75 px-4">
              Try to break through their defenses with clever prompts.
            </p>
          </div>
        )}

        <AnimatePresence>
          {chatMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              agent={agent}
            />
          ))}

          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] sm:max-w-[75%] flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center ring-2 ring-gray-400 ring-opacity-60">
                  <Image
                    src={agent.agent_profile || DEFAULT_PROFILE_URL}
                    width={32}
                    height={32}
                    alt="agent"
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-200 border border-gray-600/50 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#558EB4]" />
                  <span className="text-xs sm:text-sm">Agent is analyzing your attack...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isAgentDrained ? (
        <div className="bg-gradient-to-r from-[#12121266] to-[#1a1a1a66] backdrop-blur-xl border-t border-[#2E40494D] p-4 shadow-2xl">
          <div className="text-center w-full">
            <h3 className="text-lg font-bold text-primary_pink">This Sentinel is Drained</h3>
            <p className="text-xs text-gray-400 mb-2">
              The sentinel has been successfully defeated.
            </p>

            {winnerInfo && (
              <div className="bg-black/30 border border-[#2E40494D] rounded-lg mx-auto px-3">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:divide-x sm:divide-gray-700 gap-y-2 sm:gap-y-0">
                  <div className="flex items-baseline gap-x-2 px-3 w-full sm:w-auto justify-center">
                    <p className="text-xs font-semibold text-gray-300 shrink-0">Winner:</p>

                    <Link
                      href={`${EXPLORER_BASE_URL}/account/${winnerInfo.winnerAddress}`}
                      className="text-right underline text-sm"
                      target="_blank"
                    >
                      {' '}
                      {formatAddress(winnerInfo.winnerAddress)}
                    </Link>
                  </div>

                  <div className="flex items-baseline gap-x-2 px-3 w-full sm:w-auto justify-center">
                    <p className="text-xs font-semibold text-gray-300 shrink-0">Amount:</p>
                    <p className="text-base font-bold text-green-400">{winnerInfo.wonAmount} SUI</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#12121266] min-h-[138px] to-[#1a1a1a66] backdrop-blur-xl p-2 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="relative">
              <textarea
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value)
                  countTokens(e.target.value)
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 rounded-2xl p-3 sm:p-4 pr-16 sm:pr-20 pb-10 sm:pb-12 min-h-[50px] sm:min-h-[60px] max-h-[120px] sm:max-h-[150px] text-sm sm:text-base text-white focus:ring-2 focus:ring-[#558EB4] focus:border-[#558EB4] outline-none placeholder:text-gray-400 resize-none shadow-inner transition-all duration-200"
                disabled={isSubmitting}
                placeholder="Craft your attack prompt..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />

              <div
                className={clsx(
                  'absolute bottom-2 sm:bottom-3 backdrop-blur-lg left-3 sm:left-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded'
                )}
              >
                <span
                  className={clsx({
                    'animate-pulse': isTokenCountDebouncing,
                  })}
                >
                  Tokens: {tokenCount} / {ATTACK_PROMPT_MAX_TOKENS}
                </span>
              </div>

              {tokenCount > ATTACK_PROMPT_MAX_TOKENS && (
                <div className="mt-2 text-sm text-red-400 absolute">
                  Your prompt exceeds the token limit.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting || promptInput.length === 0 || tokenCount > ATTACK_PROMPT_MAX_TOKENS
                }
                className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#558EB4] to-[#1388D5] hover:from-[#1388D5] hover:to-[#558EB4] text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {submitError && (
              <div className="mt-2 text-red-400 text-xs sm:text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-2">
                {submitError}
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
