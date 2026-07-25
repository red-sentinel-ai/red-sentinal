/* eslint-disable react/jsx-no-comment-textnodes */
'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Trophy, ExternalLink, Scale } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { generateAvatarUrl } from '@/lib/utils'
import { getExplorerTxUrl } from '@/lib/explorer'
import { truncateAddress } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'
import { SentinelSpeechButton } from './SentinelSpeechButton'
import { useSpeechPlayback } from '@/hooks/useSpeechPlayback'
import type { Tables } from '@/lib/database.types'

type UserProfile = Pick<
  Tables<{ schema: 'sentinel' }, 'ss_users'>,
  'username' | 'avatar_url'
> | null

type ChatMessageProps = {
  message: ChatMessageType
  agent: Agent
  senderProfile: UserProfile
  isWinningPrompt?: boolean
  onShowJury?: () => void
  hideSuccessBanner?: boolean
}

export const ChatMessage = ({
  message,
  agent,
  senderProfile,
  isWinningPrompt,
  onShowJury,
  hideSuccessBanner,
}: ChatMessageProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const speech = useSpeechPlayback(message.content)

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight || '20')
      const totalLines = contentRef.current.scrollHeight / lineHeight
      setShouldTruncate(totalLines > 4)
    }
  }, [message.content])

  const username = senderProfile?.username
  const displayName =
    username || (message.sender ? truncateAddress(message.sender) : 'OPERATOR')

  const timestamp = formatDistanceToNow(new Date(Number.parseInt(message.timestamp)))

  // User Message (right-aligned)
  if (message.type === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-end gap-2"
      >
        {/* Header with username and timestamp */}
        <div className="industrial-header flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          {username ? (
            <Link href={`/u/${username}`} className="transition-colors hover:text-white">
              @{displayName.toUpperCase()}
            </Link>
          ) : (
            <span>@{displayName.toUpperCase()}</span>
          )}
          <span>//</span>
          <span>{timestamp.toUpperCase()} AGO</span>
          {isWinningPrompt && (
            <span className="text-accent flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              WINNER
            </span>
          )}
        </div>

        {/* Message Content */}
        <div
          className={clsx(
            'max-w-[85%] border p-4 lg:max-w-[75%] lg:p-5',
            isWinningPrompt ? 'border-accent/40 bg-accent/5' : 'border-white/20 bg-white/5'
          )}
        >
          <div
            ref={contentRef}
            className={clsx(
              'markdown-content',
              !isExpanded && shouldTruncate && 'line-clamp-4'
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="industrial-header mt-3 border-b border-white text-[10px] tracking-widest text-white transition-opacity hover:opacity-70"
            >
              {isExpanded ? 'COLLAPSE' : 'EXPAND'}
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Agent/Sentinel Message (left-aligned)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
    >
      {/* Header with avatar and sentinel info */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]">
          <Image
            src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
            width={32}
            height={32}
            alt={agent.agent_name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
          SENTINEL_{agent.agent_name.toUpperCase().replace(/\s+/g, '_')} //{' '}
          {timestamp.toUpperCase()} AGO
        </div>
      </div>

      {/* Message Content */}
      <div className="border-hairline max-w-[90%] bg-[var(--color-bg-elevated)]">
        <div className="p-5 lg:p-6">
          <div
            ref={contentRef}
            className={clsx(
              'markdown-content mb-6',
              !isExpanded && shouldTruncate && 'line-clamp-4'
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="industrial-header mb-6 border-b border-white text-[10px] tracking-widest text-white transition-opacity hover:opacity-70"
            >
              {isExpanded ? 'COLLAPSE' : 'EXPAND'}
            </button>
          )}

          {/* Footer with score, jury, and tx link */}
          <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border-strong)] pt-4 lg:gap-6">
            {/* Read Aloud */}
            <SentinelSpeechButton status={speech.status} onToggle={speech.toggle} />

            {/* Jury Logged Badge */}
            {message.juryResponse && onShowJury && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onShowJury()
                }}
                className="industrial-header text-accent flex items-center gap-1.5 text-[10px] transition-opacity hover:opacity-70"
              >
                <Scale className="h-3.5 w-3.5" />
                JURY_LOGGED
              </button>
            )}

            {/* Threat Score */}
            {message.score !== undefined && (
              <div className="industrial-header text-[10px] text-white">
                THREAT_SCORE:{' '}
                <span
                  className={clsx(
                    'ml-1',
                    message.score >= 80
                      ? 'text-[var(--color-danger)]'
                      : message.score >= 50
                        ? 'text-accent'
                        : 'text-accent'
                  )}
                >
                  {String(message.score).padStart(2, '0')} / 100
                </span>
              </div>
            )}

            {/* Transaction Link */}
            {message.txDigest && (
              <a
                href={getExplorerTxUrl(message.txDigest, agent.chain)}
                target="_blank"
                rel="noopener noreferrer"
                className="industrial-header ml-auto flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] transition-colors hover:text-white"
              >
                VIEW_TRACE
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {message.isSuccess && !hideSuccessBanner && (
        <div className="border-[var(--color-success)]/30 border bg-[var(--color-success-muted)] p-4">
          <div className="industrial-header text-center text-sm text-[var(--color-success)]">
            SENTINEL_BREACHED // FUNDS_EXTRACTED
          </div>
        </div>
      )}
    </motion.div>
  )
}
