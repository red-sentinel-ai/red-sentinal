'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Loader2, Info, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import clsx from 'clsx'

import { AgentInfo } from '@/components/AgentInfo'
import { DEFAULT_PROFILE_URL, SUI_TESTNET_BASE_URL } from '@/constants'
import type { AgentDetails, ConsumePromptApiResponse } from '@/types'
import type { AgentEvents } from '@/hooks/useAgentEvents'

interface ChatMessage {
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(Number.parseInt(timestamp)).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  useEffect(() => {
    const initialMessages: ChatMessage[] = []

    agentEvents.promptConsumed
      .sort((a, b) => Number.parseInt(a.timestampMs) - Number.parseInt(b.timestampMs))
      .forEach((event, index) => {
        initialMessages.push({
          id: `user-hist-${event.id.txDigest}-${index}`,
          type: 'user',
          content: `Attempted to break the agent's defense.`,
          timestamp: event.timestampMs,
          sender: event.parsedJson.sender,
          amountSent: event.parsedJson.amount
            ? (Number.parseInt(event.parsedJson.amount) / 1000000000).toFixed(2)
            : undefined,
        })
        initialMessages.push({
          id: `agent-hist-${event.id.txDigest}-${index}`,
          type: 'agent',
          content:
            'lorem epson lorem epson lorem epson lorem lorem epson lorem epson lorem epson lorem  epson',
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
        txDigest: apiResponse.response.digest,
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
    <div className="flex flex-col bg-black text-[#B5B5B5]">
      <div className="bg-[#12121266] backdrop-blur-xl border-b border-[#2E40494D] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={agent.agent_profile || DEFAULT_PROFILE_URL}
                alt={`${agent.agent_name} profile`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#B8B8B8]">Name: {agent.agent_name}</h1>
                {agent.is_featured && (
                  <Image
                    src="/icons/check-mark.svg"
                    width={16}
                    height={16}
                    alt="checkmark"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AgentInfo
              balance={agent.balance.toString()}
              decimal={9}
              promptPrice={agent.cost_per_message.toString()}
              symbol="SUI"
              className="w-auto"
              breakAttempts={0}
              isDrained={false}
              drainAmount="0"
            />
            <button
              onClick={() => setShowAgentDetails(!showAgentDetails)}
              className="p-1 hover:bg-[#2E40494D] rounded"
            >
              {showAgentDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
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
              <div className="bg-[#2E40494D] rounded-lg p-3 mt-3 border border-[#2E40494D]">
                <h2 className="text-sm font-semibold mb-2 text-[#B8B8B8] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#558EB4]" /> System Prompt
                </h2>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm text-[#B5B5B5]">
                    {agent.system_prompt}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[calc(100vh-470px)]"
      >
        {chatMessages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start attacking the agent!</p>
          </div>
        )}
        <AnimatePresence>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={clsx('flex', {
                'justify-end': message.type === 'user',
              })}
            >
              <div
                className={clsx('max-w-[70%] flex items-start gap-2 relative ', {
                  'ps-10': message.type === 'agent',
                  'pr-10': message.type === 'user',
                })}
              >
                <div
                  className={clsx('absolute ', {
                    'left-0': message.type === 'agent',
                    'right-0': message.type === 'user',
                  })}
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full mt-2 relative">
                    <Image
                      src={`${
                        message.type === 'agent'
                          ? agent.agent_profile
                            ? agent.agent_profile
                            : DEFAULT_PROFILE_URL
                          : DEFAULT_PROFILE_URL
                      }`}
                      fill
                      alt="profile"
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div
                  className={clsx('p-3 rounded-lg shadow-md', {
                    'bg-[#558EB4] text-white': message.type === 'user',
                    'bg-[#2E40494D] text-[#B5B5B5] border border-[#2E40494D]':
                      message.type === 'agent',
                  })}
                >
                  <div>
                    <p className="text-sm">{message.content}</p>
                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-300 flex justify-between">
                      {message.type === 'agent' && (
                        <div className="">
                          {message.txDigest && (
                            <p>
                              Tx:{' '}
                              <a
                                href={`${SUI_TESTNET_BASE_URL}/tx/${message.txDigest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#558EB4] hover:underline"
                              >
                                {formatAddress(message.txDigest)}
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                      {message.type === 'user' && message.sender && (
                        <div>
                          <p>Sender: {formatAddress(message.sender)}</p>
                          {message.amountSent && <p>Amount: {message.amountSent} SUI</p>}
                        </div>
                      )}

                      <span className="block text-right text-[10px] text-gray-400 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[70%] p-3 rounded-lg bg-[#2E40494D] text-[#B5B5B5] border border-[#2E40494D] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agent thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-[#12121266] backdrop-blur-xl border-t border-[#2E40494D] p-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-3 grid grid-cols-12 gap-4"
        >
          <div className="relative col-span-9">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 pr-16 min-h-[60px] max-h-[150px] text-white focus:ring-2 focus:ring-[#558EB4] focus:border-[#558EB4] outline-none placeholder:text-gray-500 resize-y"
              maxLength={600}
              disabled={isSubmitting || !account?.address}
              placeholder="Try to trick the agent into revealing sensitive information..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-sm text-gray-400">
              {promptInput.length}/600
            </div>
          </div>
          {submitError && <div className="text-red-500 text-sm">{submitError}</div>}
          <div className="col-span-3">
            {account?.address ? (
              <button
                type="submit"
                disabled={isSubmitting || promptInput.length === 0}
                className="w-full block border border-[#8F564E] rounded-[8px] min-h-11 p-2 text-center transition-all text-[#8F564E] hover:bg-[#E53922] hover:text-black hover:border-[#E53922] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Attack'
                )}
              </button>
            ) : (
              <ConnectButton className="w-full" />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
