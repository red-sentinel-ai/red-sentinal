'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { DEFAULT_PROFILE_URL, EXPLORER_BASE_URL, SUI_TESTNET_BASE_URL } from '@/constants'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'
import Link from 'next/link'

type ChatMessageProps = {
  message: ChatMessageType
  agent: AgentDetails
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
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
        {message.type === 'user' && (
          <div className="flex-shrink-0">
            <div className="w-7 h-7 rounded-full relative ring-2 ring-opacity-60">
              <Image
                src={DEFAULT_PROFILE_URL}
                fill
                alt="profile"
                className="rounded-full object-cover"
              />
            </div>
          </div>
        )}

        <div
          className={clsx('rounded-2xl shadow-lg relative min-w-[350px]', {
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
            {message.type === 'user' && message.sender && (
              <div className="flex flex-col gap-1 text-xs opacity-75 text-white mb-2 -mt-1">
                <Link
                  href={`${EXPLORER_BASE_URL}/account/${message.sender}`}
                  className="text-right underline"
                  target="_blank"
                >
                  {' '}
                  {formatAddress(message.sender)}
                </Link>
              </div>
            )}
            <div className="mb-2 sm:mb-3">
              <p
                ref={contentRef}
                className={clsx(
                  'text-xs sm:text-sm leading-relaxed break-words  transition-all duration-200 ease-in-out',
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
              <div className="flex flex-col gap-1"></div>
              <div className="text-right flex gap-3 opacity-75 text-[11px] whitespace-nowrap absolute right-3 bottom-1">
                {message.type === 'agent' && message.txDigest && (
                  <a
                    href={`${SUI_TESTNET_BASE_URL}/${message.txDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all lowercase"
                  >
                    {formatAddress(message.txDigest)}
                  </a>
                )}
                {message.type === 'agent' && message.score !== undefined && (
                  <span className="font-medium">Score: {message.score}/100</span>
                )}
                {formatDistanceToNow(message.timestamp)} ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
