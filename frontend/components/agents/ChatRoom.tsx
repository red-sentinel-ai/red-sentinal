'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { Loader2, Send, ArrowLeft, Users, Shield, Swords, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectModal } from '@mysten/dapp-kit'
import { toast } from 'sonner'

import { generateAvatarUrl } from '@/lib/utils'
import { truncateAddress } from '@/lib/utils'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'
import {
  useChatMessages,
  useSendChatMessage,
  useCanSendMessage,
  useChatSubscription,
  useMentionAutocomplete,
} from '@/hooks/chat'
import type { AgentDetailsFull } from '@/hooks/agents/useAgentDetails'
import type { ChatMessage, ChatSenderRole } from '@/types/chat'
import { ChatMessageContent } from './ChatMessageContent'
import { MentionSuggestionsDropdown } from './MentionSuggestionsDropdown'

interface ChatRoomProps {
  agent: AgentDetailsFull
  onBack: () => void
}

const ROLE_CONFIG: Record<ChatSenderRole, { icon: typeof Shield; label: string; color: string }> = {
  owner: { icon: Crown, label: 'OWNER', color: 'text-[var(--color-gold-primary)]' },
  attacker: { icon: Swords, label: 'ATTACKER', color: 'text-[var(--color-danger)]' },
  syndicate_member: { icon: Users, label: 'SYNDICATE', color: 'text-[var(--color-accent)]' },
}

function ChatMessageBubble({
  message,
  senderProfile,
  isOwnMessage,
}: {
  message: ChatMessage
  senderProfile: { username?: string; avatar_url?: string | null } | null
  isOwnMessage: boolean
}) {
  const roleConfig = ROLE_CONFIG[message.sender_role]
  const RoleIcon = roleConfig.icon

  const profileLink = `/u/${senderProfile?.username || message.sender_address}`
  const displayName = senderProfile?.username || truncateAddress(message.sender_address)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex gap-3', isOwnMessage && 'flex-row-reverse')}
    >
      {/* Avatar */}
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

      {/* Message Content */}
      <div className={clsx('flex max-w-[70%] flex-col gap-1', isOwnMessage && 'items-end')}>
        {/* Header */}
        <div
          className={clsx('flex items-center gap-2', isOwnMessage && 'flex-row-reverse')}
        >
          <Link
            href={profileLink}
            className="industrial-header text-[10px] text-[var(--color-text-secondary)] transition-opacity hover:opacity-70"
          >
            {displayName}
          </Link>
          <div className={clsx('flex items-center gap-1', roleConfig.color)}>
            <RoleIcon className="h-3 w-3" />
            <span className="industrial-header text-[8px]">{roleConfig.label}</span>
          </div>
        </div>

        {/* Bubble */}
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

        {/* Timestamp */}
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

export function ChatRoom({ agent, onBack }: ChatRoomProps) {
  const [messageInput, setMessageInput] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  const { address: connectedAddress } = useConnectedAddress()

  const mentionAutocomplete = useMentionAutocomplete({
    value: messageInput,
    onChange: setMessageInput,
    textareaRef,
  })

  // Fetch chat messages
  const {
    data: chatData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useChatMessages(agent.agent_id)

  // Check if user can send messages
  const { data: canSendData } = useCanSendMessage(agent.agent_id, connectedAddress || undefined)

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage()

  // Real-time subscription
  // Note: We need the room_id from the first message or from a separate endpoint
  // For now, we'll use polling as fallback until room_id is available
  const roomId = chatData?.messages?.[0]?.room_id
  const { isConnected } = useChatSubscription({
    roomId,
    agentId: agent.agent_id,
    onNewMessage: () => {
      refetchMessages()
    },
  })

  // Get unique sender addresses for profile fetching
  const senderAddresses = useMemo(() => {
    const addresses = (chatData?.messages || []).map(msg => msg.sender_address)
    return [...new Set(addresses)]
  }, [chatData?.messages])

  const { data: userProfilesMap } = useUserProfiles(senderAddresses)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatData?.messages])

  // Adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = Math.min(window.innerHeight * 0.3, 150)
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [messageInput])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connectedAddress) {
      setIsWalletModalOpen(true)
      return
    }

    if (!canSendData?.can_send) {
      toast.error('You must be an owner, attacker, or syndicate member to send messages')
      return
    }

    if (!messageInput.trim() || isSending) return

    const content = messageInput.trim()
    setMessageInput('')

    sendMessage(
      {
        agentId: agent.agent_id,
        content,
        senderAddress: connectedAddress,
      },
      {
        onError: error => {
          toast.error(error.message || 'Failed to send message')
          setMessageInput(content) // Restore the message on error
        },
      }
    )
  }

  const canSend = canSendData?.can_send ?? false
  const userRole = canSendData?.role

  return (
    <div className="flex h-full flex-1 flex-col bg-[var(--color-bg-base)]">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border-strong)] px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] transition-colors hover:border-white hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="industrial-header text-[10px] tracking-widest">BACK</span>
          </button>
          <div className="h-4 w-px bg-[var(--color-border-strong)]" />
          <span className="industrial-header text-[11px] tracking-widest text-white">
            COMMUNITY_CHAT
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-success)]" />
              <span className="industrial-header text-[9px] text-[var(--color-success)]">LIVE</span>
            </div>
          )}
          <span className="industrial-header text-[9px] text-[var(--color-text-muted)]">
            {chatData?.total || 0} MESSAGES
          </span>
        </div>
      </div>

      {/* Chat Feed */}
      <div
        ref={chatContainerRef}
        className="terminal-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4 lg:p-6"
      >
        {messagesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
          </div>
        )}

        {!messagesLoading && (!chatData?.messages || chatData.messages.length === 0) && (
          <div className="py-12 text-center">
            <span className="industrial-header text-[10px] tracking-[6px] text-[var(--color-text-muted)] opacity-40">
              NO_MESSAGES_YET
            </span>
            <p className="mt-2 font-mono text-[11px] text-[var(--color-text-muted)]/50">
              Be the first to start the conversation
            </p>
          </div>
        )}

        <AnimatePresence>
          {chatData?.messages?.map(message => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              senderProfile={userProfilesMap?.[message.sender_address?.toLowerCase()] || null}
              isOwnMessage={message.sender_address === connectedAddress}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 py-3 lg:px-6">
        {/* Permission Info */}
        {connectedAddress && !canSend && (
          <div className="mb-3 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
              You must be the agent owner, have made at least one attack, or be a syndicate member
              to send messages.
            </p>
          </div>
        )}

        {userRole && (
          <div className="mb-2 flex items-center gap-2">
            <span className="industrial-header text-[9px] text-[var(--color-text-muted)]">
              CHATTING_AS:
            </span>
            <span
              className={clsx(
                'industrial-header flex items-center gap-1 text-[9px]',
                ROLE_CONFIG[userRole].color
              )}
            >
              {(() => {
                const Icon = ROLE_CONFIG[userRole].icon
                return <Icon className="h-3 w-3" />
              })()}
              {ROLE_CONFIG[userRole].label}
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

      <ConnectModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        trigger={<span className="hidden" />}
      />
    </div>
  )
}
