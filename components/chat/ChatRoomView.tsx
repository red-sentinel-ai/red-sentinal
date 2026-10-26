'use client'

import type React from 'react'
import { useState, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { Loader2, Send, ArrowLeft, MessageSquare } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'

import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import { useMentionAutocomplete } from '@/hooks/chat'
import { MentionSuggestionsDropdown } from '@/components/agents/MentionSuggestionsDropdown'
import { ChatMessageBubble } from './ChatMessageBubble'
import type { ChatRoomMessage, ChatRoleStyle, ChatRoleStyleMap } from './types'

const FALLBACK_ROLE_STYLE: ChatRoleStyle = {
  icon: MessageSquare,
  label: 'MEMBER',
  color: 'text-[var(--color-text-muted)]',
}

interface ChatRoomViewProps {
  headerLabel: string
  messages: ChatRoomMessage[]
  totalMessages: number
  isLoadingMessages: boolean
  isLive?: boolean
  canSend: boolean
  userRole?: string | null
  roleStyles: ChatRoleStyleMap
  permissionHint: string
  permissionToast: string
  emptyTitle?: string
  emptySubtitle?: string
  connectedAddress?: string
  onRequestConnect: () => void
  isSending: boolean
  onSend: (content: string) => Promise<boolean>
  onBack: () => void
}

export function ChatRoomView({
  headerLabel,
  messages,
  totalMessages,
  isLoadingMessages,
  isLive = false,
  canSend,
  userRole,
  roleStyles,
  permissionHint,
  permissionToast,
  emptyTitle = 'NO_MESSAGES_YET',
  emptySubtitle = 'Be the first to start the conversation',
  connectedAddress,
  onRequestConnect,
  isSending,
  onSend,
  onBack,
}: ChatRoomViewProps) {
  const [messageInput, setMessageInput] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mentionAutocomplete = useMentionAutocomplete({
    value: messageInput,
    onChange: setMessageInput,
    textareaRef,
  })

  const senderAddresses = useMemo(
    () => [...new Set(messages.map(msg => msg.sender_address))],
    [messages]
  )
  const { data: userProfilesMap } = useUserProfiles(senderAddresses)

  const resolveRoleStyle = (role: string) => roleStyles[role] ?? FALLBACK_ROLE_STYLE

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = Math.min(window.innerHeight * 0.3, 150)
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [messageInput])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connectedAddress) {
      onRequestConnect()
      return
    }

    if (!canSend) {
      toast.error(permissionToast)
      return
    }

    const content = messageInput.trim()
    if (!content || isSending) return

    setMessageInput('')
    const ok = await onSend(content)
    if (!ok) setMessageInput(content)
  }

  const userRoleStyle = userRole ? resolveRoleStyle(userRole) : null

  return (
    <div className="flex h-full flex-1 flex-col bg-[var(--color-bg-base)]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="industrial-header text-[10px] tracking-[0.06em]">BACK</span>
          </button>
          <div className="h-4 w-px bg-[var(--color-border-strong)]" />
          <span className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-white">
            {headerLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-success)]" />
              <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-success)]">
                LIVE
              </span>
            </div>
          )}
          <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
            {totalMessages} MESSAGES
          </span>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="terminal-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4 lg:p-6"
      >
        {isLoadingMessages && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <div className="py-12 text-center">
            <span className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] opacity-40">
              {emptyTitle}
            </span>
            <p className="mt-2 font-mono text-[11px] text-[var(--color-text-muted)]">
              {emptySubtitle}
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map(message => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              roleStyle={resolveRoleStyle(message.sender_role)}
              senderProfile={userProfilesMap?.[message.sender_address?.toLowerCase()] || null}
              isOwnMessage={message.sender_address === connectedAddress}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 py-3 lg:px-6">
        {connectedAddress && !canSend && (
          <div className="mb-3 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2">
            <p className="font-mono text-[11px] text-[var(--color-text-muted)]">{permissionHint}</p>
          </div>
        )}

        {userRoleStyle && (
          <div className="mb-2 flex items-center gap-2">
            <span className="industrial-header text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
              CHATTING_AS:
            </span>
            <span
              className={clsx(
                'industrial-header flex items-center gap-1 text-[10px] font-semibold tracking-[0.06em]',
                userRoleStyle.color
              )}
            >
              <userRoleStyle.icon className="h-3 w-3" />
              {userRoleStyle.label}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] transition-all focus-within:border-white">
            <MentionSuggestionsDropdown
              isOpen={mentionAutocomplete.isOpen}
              isLoading={mentionAutocomplete.isLoading}
              suggestions={mentionAutocomplete.suggestions}
              highlightedIndex={mentionAutocomplete.highlightedIndex}
              onSelect={mentionAutocomplete.selectSuggestion}
              onHighlight={mentionAutocomplete.setHighlightedIndex}
            />
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={e => {
                setMessageInput(e.target.value)
                mentionAutocomplete.syncMentionFromTextarea(e.target)
              }}
              onSelect={e => mentionAutocomplete.syncMentionFromTextarea(e.currentTarget)}
              onBlur={mentionAutocomplete.closeSuggestions}
              className="terminal-scrollbar placeholder:text-[var(--color-text-muted)]/30 min-h-[44px] w-full resize-none border-0 bg-[var(--color-bg-base)] px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-0"
              disabled={isSending || !canSend}
              placeholder={
                !connectedAddress
                  ? 'Connect wallet to chat...'
                  : !canSend
                    ? 'You need permission to send messages...'
                    : 'Type your message... use @ to mention'
              }
              rows={1}
              style={{ overflow: 'hidden' }}
              autoComplete="off"
              spellCheck="false"
              onKeyDown={e => {
                if (mentionAutocomplete.handleKeyDown(e)) return
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <div className="flex items-center justify-end border-t border-[var(--color-border-default)] px-3 py-2">
              <button
                type="submit"
                disabled={isSending || !messageInput.trim() || !canSend}
                className="button-ghost-terminal flex items-center gap-2 px-4 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>SEND</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
