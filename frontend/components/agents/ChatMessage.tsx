'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'
import { formatAddress } from '@mysten/sui/utils'
import { DEFAULT_PROFILE_URL, SUI_TESTNET_BASE_URL } from '@/constants'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'
import Link from 'next/link'
import type { Tables } from '@/lib/database.types'

type UserProfile = Pick<Tables<'ss_users'>, 'username' | 'avatar_url'> | null

type ChatMessageProps = {
  message: ChatMessageType
  agent: AgentDetails
  senderProfile: UserProfile
  isWinningPrompt?: boolean
  onShowJury?: () => void
}

export const ChatMessage = ({ 
  message, 
  senderProfile, 
  isWinningPrompt, 
  onShowJury 
}: ChatMessageProps) => {
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

  const avatarUrl = senderProfile?.avatar_url || DEFAULT_PROFILE_URL
  const displayName =
    senderProfile?.username || (message.sender ? formatAddress(message.sender) : 'User')
  const profileLink = `/u/${senderProfile?.username || message.sender}`

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
            <Link href={profileLink}>
              <div className="w-7 h-7 rounded-full relative border border-gray-200">
                <Image
                  src={avatarUrl}
                  fill
                  alt={displayName}
                  className="rounded-full object-cover"
                />
              </div>
            </Link>
          </div>
        )}

        <div
          className={clsx(
            'rounded-2xl shadow-sm relative min-w-[350px] text-black backdrop-blur-sm',
            {
              'bg-[#A3BCF2]/20 border border-[#5E5E5E]': message.type === 'agent',
              'bg-gradient-to-tr from-[#C4A7FF]/25 to-[#FD6ADD]/25 border border-[#5E5E5E]':
                message.type === 'user' && !isWinningPrompt,
              'border border-yellow-300 bg-yellow-50 shadow-md shadow-yellow-100': isWinningPrompt,
            }
          )}
        >
          <div className="relative p-3 sm:p-4">
            {message.type === 'user' && message.sender && (
              <div className="flex items-center justify-between gap-1 text-xs mb-2 -mt-1">
                <Link
                  href={profileLink}
                  className="font-semibold text-black hover:underline"
                >
                  {displayName}
                </Link>
                {isWinningPrompt && (
                  <div className="flex items-center gap-1.5 bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <Trophy className="w-3 h-3" />
                    Winner
                  </div>
                )}
              </div>
            )}
            <div className="mb-2 sm:mb-3">
              <p
                ref={contentRef}
                className={clsx(
                  'text-xs sm:text-sm leading-relaxed break-words text-black transition-all duration-200 ease-in-out',
                  !isExpanded && 'line-clamp-4'
                )}
              >
                {message.content}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-blue-600 text-xs hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            <div
              className={clsx(
                'text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'
              )}
            >
              <div className="flex flex-col gap-1"></div>
              <div className="text-right flex gap-3 text-[#666666] text-[11px] whitespace-nowrap absolute right-3 bottom-1">
                {message.type === 'agent' && message.txDigest && (
                  <a
                    href={`${SUI_TESTNET_BASE_URL}/${message.txDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all lowercase text-[#0F23A7]"
                  >
                    {formatAddress(message.txDigest)}
                  </a>
                )}
                {message.type === 'agent' && message.score !== undefined && (
                  <span className="font-medium text-black">Score: {message.score}/100</span>
                )}

                 {message.type === 'agent' && message.juryResponse && onShowJury && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowJury();
                      }}
                      className="flex items-center gap-1.5 text-[10px] text-[#0F23A7] underline hover:no-underline transition-all cursor-pointer w-fit"
                    >
                      <Image
                        src="/icons/court_house_blue.png"
                        width="10"
                        height="10"
                        alt="Court House"
                      />
                        Jury Response
                    </button>
              )}

                {formatDistanceToNow(new Date(Number.parseInt(message.timestamp)))} ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
