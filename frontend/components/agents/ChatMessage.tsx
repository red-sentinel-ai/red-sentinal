'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'
import { DEFAULT_PROFILE_URL, SUIVISION_TXBLOCK_URL } from '@/constants'
import { SOLANA_EXPLORER_TX_URL, SOLANA_EXPLORER_TX_SUFFIX } from '@/constants/solana'
import { truncateAddress } from '@/lib/utils'
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
  agent,
  senderProfile,
  isWinningPrompt,
  onShowJury,
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
    senderProfile?.username || (message.sender ? truncateAddress(message.sender) : 'User')
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
        className={clsx('relative flex max-w-[85%] items-start gap-2 sm:max-w-[75%] sm:gap-3', {
          'flex-row-reverse': message.type === 'user',
        })}
      >
        {message.type === 'user' && (
          <div className="flex-shrink-0">
            <Link href={profileLink}>
              <div className="relative h-7 w-7 rounded-full border border-gray-200">
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
            'relative min-w-[350px] rounded-2xl text-black shadow-sm backdrop-blur-sm',
            {
              'border border-[#5E5E5E] bg-[#A3BCF2]/20': message.type === 'agent',
              'border border-[#5E5E5E] bg-gradient-to-tr from-[#C4A7FF]/25 to-[#FD6ADD]/25':
                message.type === 'user' && !isWinningPrompt,
              'border border-yellow-300 bg-yellow-50 shadow-md shadow-yellow-100': isWinningPrompt,
            }
          )}
        >
          <div className="relative p-3 sm:p-4">
            {message.type === 'user' && message.sender && (
              <div className="-mt-1 mb-2 flex items-center justify-between gap-1 text-xs">
                <Link href={profileLink} className="font-semibold text-black hover:underline">
                  {displayName}
                </Link>
                {isWinningPrompt && (
                  <div className="flex items-center gap-1.5 rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                    <Trophy className="h-3 w-3" />
                    Winner
                  </div>
                )}
              </div>
            )}
            <div className="mb-2 sm:mb-3">
              <p
                ref={contentRef}
                className={clsx(
                  'break-words text-xs leading-relaxed text-black transition-all duration-200 ease-in-out sm:text-sm',
                  !isExpanded && 'line-clamp-4'
                )}
              >
                {message.content}
              </p>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            <div
              className={clsx(
                'flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between'
              )}
            >
              <div className="flex flex-col gap-1"></div>
              <div className="absolute bottom-1 right-3 flex gap-3 whitespace-nowrap text-right text-[11px] text-[#666666]">
                {message.type === 'agent' && message.txDigest && (
                  <a
                    href={
                      agent.chain === 'solana'
                        ? `${SOLANA_EXPLORER_TX_URL}${message.txDigest}${SOLANA_EXPLORER_TX_SUFFIX}`
                        : `${SUIVISION_TXBLOCK_URL}/${message.txDigest}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all lowercase text-[#0F23A7] underline"
                  >
                    {truncateAddress(message.txDigest)}
                  </a>
                )}
                {message.type === 'agent' && message.score !== undefined && (
                  <span className="font-medium text-black">Score: {message.score}/100</span>
                )}
                {message.type === 'agent' && message.juryResponse && onShowJury && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onShowJury()
                    }}
                    className="flex w-fit cursor-pointer items-center gap-1.5 text-[10px] text-[#0F23A7] underline transition-all hover:no-underline"
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
