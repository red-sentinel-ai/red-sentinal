'use client'

import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { motion } from 'framer-motion'

import { generateAvatarUrl, truncateAddress } from '@/lib/utils'
import { ChatMessageContent } from '@/components/agents/ChatMessageContent'
import type { ChatRoomMessage, ChatRoleStyle } from './types'

interface ChatMessageBubbleProps {
  message: ChatRoomMessage
  roleStyle: ChatRoleStyle
  senderProfile: { username?: string; avatar_url?: string | null } | null
  isOwnMessage: boolean
}

export function ChatMessageBubble({
  message,
  roleStyle,
  senderProfile,
  isOwnMessage,
}: ChatMessageBubbleProps) {
  const RoleIcon = roleStyle.icon
  const profileLink = `/u/${senderProfile?.username || message.sender_address}`
  const displayName = senderProfile?.username || truncateAddress(message.sender_address)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex gap-3', isOwnMessage && 'flex-row-reverse')}
    >
      <Link
        href={profileLink}
        className="group flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] transition-all hover:border-white"
      >
        <Image
          src={senderProfile?.avatar_url || generateAvatarUrl(message.sender_address)}
          width={32}
          height={32}
          alt="user"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className={clsx('flex max-w-[70%] flex-col gap-1', isOwnMessage && 'items-end')}>
        <div className={clsx('flex items-center gap-2', isOwnMessage && 'flex-row-reverse')}>
          <Link
            href={profileLink}
            className="industrial-header text-[10px] text-[var(--color-text-secondary)] transition-opacity hover:opacity-70"
          >
            {displayName}
          </Link>
          <div className={clsx('flex items-center gap-1', roleStyle.color)}>
            <RoleIcon className="h-3 w-3" />
            <span className="industrial-header text-[8px]">{roleStyle.label}</span>
          </div>
        </div>

        <div
          className={clsx(
            'border-hairline px-4 py-2.5',
            isOwnMessage
              ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)]/30'
              : 'bg-[var(--color-bg-elevated)]'
          )}
        >
          <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-white">
            <ChatMessageContent content={message.content} />
          </p>
        </div>

        <span className="industrial-header text-[8px] text-[var(--color-text-muted)]/50">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  )
}
