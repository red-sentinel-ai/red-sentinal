'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { DEFAULT_PROFILE_URL, SUI_TESTNET_BASE_URL } from '@/constants'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'

type ChatMessageProps = {
  message: ChatMessageType
  agent: AgentDetails
}

export const ChatMessage = ({ message, agent }: ChatMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight || '20')
      const totalLines = contentRef.current.scrollHeight / lineHeight
      setShouldTruncate(totalLines > 4)
    }
  }, [message.content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={clsx('flex', {
        'justify-end': message.type === 'user',
        'justify-start': message.type === 'agent',
      })}
    >
      <div
        className={clsx('max-w-[85%] sm:max-w-[75%] flex items-start gap-2 sm:gap-3 relative', {
          'flex-row-reverse': message.type === 'user',
        })}
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full relative ring-2 ring-opacity-60">
            <Image
              src={
                message.type === 'agent'
                  ? agent.agent_profile || DEFAULT_PROFILE_URL
                  : DEFAULT_PROFILE_URL
              }
              fill
              alt="profile"
              className="rounded-full object-cover"
            />
          </div>
        </div>

        <div
          className={clsx('rounded-2xl shadow-lg relative min-w-[160px]', {
            'bg-gradient-to-r from-[#558EB4] to-[#1388D5] text-white border border-[#558EB4]/30':
              message.type === 'agent',
            'bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-200 border border-gray-600/50':
              message.type === 'user',
          })}
        >
          {message.type === 'agent' && message.isSuccess !== undefined && (
            <div className="absolute inset-0 rounded-2xl opacity-20 blur-sm" />
          )}
          <div className="relative p-3 sm:p-4">
            {message.type === 'agent' && (
              <div className="text-sm font-semibold text-white">System analysis: </div>
            )}

            {message.type === 'user' && message.sender && (
              <div className="flex flex-col gap-1 text-sm font-semibold text-white mb-2 -mt-1">
                <span> {formatAddress(message.sender)}</span>
              </div>
            )}
            <div className="mb-2 sm:mb-3">
              <p
                ref={contentRef}
                className={clsx(
                  'text-xs sm:text-sm leading-relaxed break-words transition-all duration-200 ease-in-out',
                  !isExpanded && 'line-clamp-4'
                )}
              >
                {message.content}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-blue-300 text-xs hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            <div
              className={clsx(
                'text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2',
                {
                  'border-white/20': message.type === 'user',
                  'border-gray-500/30': message.type === 'agent',
                }
              )}
            >
              <div className="flex flex-col gap-1">
                {message.type === 'agent' && message.score !== undefined && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">Score: {message.score}/100</span>
                  </div>
                )}
                {message.type === 'agent' && message.txDigest && (
                  <div className="flex items-center gap-1">
                    <span>Verified Tx:</span>
                    <a
                      href={`${SUI_TESTNET_BASE_URL}/${message.txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline font-mono break-all"
                    >
                      {formatAddress(message.txDigest)}
                    </a>
                  </div>
                )}
              </div>
              <span className="text-right opacity-75 text-xs whitespace-nowrap absolute right-3 bottom-1">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
