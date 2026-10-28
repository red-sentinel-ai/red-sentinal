/* eslint-disable react/jsx-no-comment-textnodes */
'use client'
import type React from 'react'
import { useState, useRef, useEffect, memo } from 'react'
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
import { Dialog } from '@/components/Dialog'
import { AttackShareCard } from '@/components/agents/AttackShareCard'
import type { Agent } from '@/types/agents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'
import { SentinelSpeechButton } from './SentinelSpeechButton'
import { useSpeechPlayback } from '@/hooks/useSpeechPlayback'
import type { Tables } from '@/lib/database.types'

type UserProfile = Pick<
  Tables<{ schema: 'sentinel' }, 'ss_users'>,
  'username' | 'avatar_url'
> | null

const COLLAPSED_MESSAGE_CLAMP = 'line-clamp-[14]'

const CONTENT_OVERFLOW_TOLERANCE_PX = 2

const ONCHAIN_BREACH_BANNER_LABEL = 'SENTINEL_BREACHED // FUNDS_EXTRACTED'

/** A breach with nothing to pay out still defeats the sentinel — the banner
 * just shouldn't claim funds moved. */
const ONCHAIN_OBJECTIVE_BANNER_LABEL = 'SENTINEL_BREACHED // OBJECTIVE_COMPLETE'

type ChatMessageProps = {
  message: ChatMessageType
  agent: Agent
  senderProfile: UserProfile
  isWinningPrompt?: boolean
  onShowJury?: () => void
  hideSuccessBanner?: boolean
  successBannerLabel?: string
}

function ChatMessageBase({
  message,
  agent,
  senderProfile,
  isWinningPrompt,
  onShowJury,
  hideSuccessBanner,
  successBannerLabel,
}: ChatMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isContentClamped, setIsContentClamped] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const speech = useSpeechPlayback(message.content)

  useEffect(() => {
    const contentElement = contentRef.current
    if (!contentElement || isExpanded) return

    const measureContentOverflow = () =>
      setIsContentClamped(
        contentElement.scrollHeight - contentElement.clientHeight > CONTENT_OVERFLOW_TOLERANCE_PX
      )

    measureContentOverflow()
    const resizeObserver = new ResizeObserver(measureContentOverflow)
    resizeObserver.observe(contentElement)
    return () => resizeObserver.disconnect()
  }, [message.content, isExpanded])

  const username = senderProfile?.username
  const displayName = username || (message.sender ? truncateAddress(message.sender) : 'OPERATOR')

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
        <div className="industrial-header flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[10px] font-medium tracking-[0.06em] text-[var(--color-text-muted)] sm:text-[11px]">
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
            'max-w-[92%] border p-3 sm:max-w-[85%] sm:p-4 lg:max-w-[75%] lg:p-5',
            isWinningPrompt ? 'border-accent/40 bg-accent/5' : 'border-white/20 bg-white/5'
          )}
        >
          <div
            ref={contentRef}
            className={clsx('markdown-content', !isExpanded && COLLAPSED_MESSAGE_CLAMP)}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {isContentClamped && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="industrial-header mt-3 border-b border-white text-[10px] tracking-[0.06em] text-white transition-opacity hover:opacity-70"
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
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] sm:h-8 sm:w-8">
          <Image
            src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
            width={32}
            height={32}
            alt={agent.agent_name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="industrial-header min-w-0 break-all text-[10px] font-medium tracking-[0.06em] text-[var(--color-text-muted)] sm:text-[11px]">
          SENTINEL_{agent.agent_name.toUpperCase().replace(/\s+/g, '_')} //{' '}
          {timestamp.toUpperCase()} AGO
        </div>
      </div>

      {/* Message Content */}
      <div className="border-hairline max-w-full bg-[var(--color-bg-elevated)] sm:max-w-[90%]">
        <div className="p-3 sm:p-5 lg:p-6">
          <div
            ref={contentRef}
            className={clsx(
              'markdown-content mb-4 sm:mb-6',
              !isExpanded && COLLAPSED_MESSAGE_CLAMP
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {isContentClamped && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="industrial-header mb-4 border-b border-white text-[10px] tracking-[0.06em] text-white transition-opacity hover:opacity-70 sm:mb-6"
            >
              {isExpanded ? 'COLLAPSE' : 'EXPAND'}
            </button>
          )}

          {/* Footer with score, jury, and tx link */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--color-border-strong)] pt-3 sm:gap-4 sm:pt-4 lg:gap-6">
            {/* Read Aloud */}
            <SentinelSpeechButton status={speech.status} onToggle={speech.toggle} />

            {/* Jury Logged Badge */}
            {message.juryResponse && onShowJury && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onShowJury()
                }}
                className="industrial-header text-accent flex items-center gap-1.5 text-[10px] tracking-[0.06em] transition-opacity hover:opacity-70"
              >
                <Scale className="h-3.5 w-3.5" />
                JURY_LOGGED
              </button>
            )}

            {/* Threat Score */}
            {message.score !== undefined && (
              <div className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-white">
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

            {/* Share on X — opens the full share card with copy/instructions */}
            {message.score !== undefined && (
              <button
                onClick={() => setIsShareOpen(true)}
                className="industrial-header ml-auto flex items-center gap-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] transition-colors hover:text-white"
              >
                SHARE_ON_X
                <Image src="/icons/x.svg" width={12} height={12} alt="" />
              </button>
            )}

            {/* Transaction Link */}
            {message.txDigest && (
              <a
                href={getExplorerTxUrl(message.txDigest, agent.chain)}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'industrial-header flex items-center gap-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] transition-colors hover:text-white',
                  message.score === undefined && 'ml-auto'
                )}
              >
                VIEW_ONCHAIN
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {message.walrusBlobId && (
              <a
                href={`/evidence/${message.walrusBlobId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'industrial-header flex items-center gap-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] transition-colors hover:text-white',
                  !message.txDigest && message.score === undefined && 'ml-auto'
                )}
              >
                SEE_ON_WALRUS
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {message.isSuccess && !hideSuccessBanner && (
        <div className="border-[var(--color-success)]/30 border bg-[var(--color-success-muted)] p-4">
          <div className="industrial-header text-center text-sm font-semibold tracking-[0.08em] text-[var(--color-success)]">
            {successBannerLabel ??
              (Number(message.amountWon) > 0
                ? ONCHAIN_BREACH_BANNER_LABEL
                : ONCHAIN_OBJECTIVE_BANNER_LABEL)}
          </div>
        </div>
      )}

      {/* Share dialog — the full jury card plus copy/paste instructions */}
      {message.score !== undefined && (
        <Dialog
          open={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          className="flex max-h-[90dvh] w-[92vw] max-w-[560px] flex-col overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-0"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <h2 className="industrial-header text-sm font-semibold tracking-[0.08em] text-white">
              SHARE THIS RUN
            </h2>
            <button
              onClick={() => setIsShareOpen(false)}
              aria-label="Close share dialog"
              className="flex h-7 w-7 items-center justify-center rounded-full text-xl leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="ios-scroll min-h-0 flex-1 overflow-y-auto p-5">
            <AttackShareCard
              agent={agent}
              success={!!message.isSuccess}
              score={message.score}
              prompt={message.sharePrompt || ''}
              reply={message.content}
              attackId={message.attackId}
            />
          </div>
        </Dialog>
      )}
    </motion.div>
  )
}

export const ChatMessage = memo(ChatMessageBase, (prev, next) => {
  // Data props are immutable per message (they come from react-query
  // history) — only re-render when one of them actually changes. Callback
  // identity is deliberately ignored: onShowJury is behaviorally identical
  // across renders, and every keystroke in the composer used to re-run
  // ReactMarkdown for every historical message.
  return (
    prev.message === next.message &&
    prev.agent === next.agent &&
    prev.senderProfile === next.senderProfile &&
    prev.isWinningPrompt === next.isWinningPrompt &&
    prev.hideSuccessBanner === next.hideSuccessBanner &&
    prev.successBannerLabel === next.successBannerLabel
  )
})
