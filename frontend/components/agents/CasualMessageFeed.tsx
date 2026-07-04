'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { generateAvatarUrl } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { ChatMessage } from './ChatMessage'
import { useUserProfiles } from '@/hooks/profile/useUserProfiles'

interface CasualMessageFeedProps {
  agent: Agent
  messages: ChatMessageType[]
  attackerAddress: string
  isSubmitting: boolean
  onShowJury: (juryResponse: string) => void
}

export function CasualMessageFeed({
  agent,
  messages,
  attackerAddress,
  isSubmitting,
  onShowJury,
}: CasualMessageFeedProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global')
  const scrollRef = useRef<HTMLDivElement>(null)

  const senderAddresses = useMemo(() => {
    const addresses = messages
      .filter(msg => msg.type === 'user' && msg.sender)
      .map(msg => msg.sender!)
    return [...new Set(addresses)]
  }, [messages])
  const { data: userProfilesMap } = useUserProfiles(senderAddresses)

  const displayedMessages = useMemo(() => {
    if (activeTab === 'global') return messages
    if (!attackerAddress) return []
    const mine: ChatMessageType[] = []
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (msg.type === 'user' && msg.sender === attackerAddress) {
        mine.push(msg)
        if (messages[i + 1]?.type === 'agent') {
          mine.push(messages[i + 1])
          i++
        }
      }
    }
    return mine
  }, [messages, activeTab, attackerAddress])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayedMessages, isSubmitting])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tabs + casual banner */}
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-[var(--color-border-strong)] px-6 lg:px-8">
        {(['global', 'mine'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'industrial-header h-12 border-b-2 px-1 text-[11px] tracking-widest transition-colors',
              activeTab === tab
                ? 'border-white text-white'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            )}
          >
            {tab === 'global' ? 'ALL_CASUAL_RUNS' : 'MY_CASUAL_RUNS'}
          </button>
        ))}
        <span className="industrial-header ml-auto text-[9px] tracking-[4px] text-[var(--color-text-muted)]/60">
          FREE // OFF-CHAIN
        </span>
      </div>

      <div
        ref={scrollRef}
        className="terminal-scrollbar min-h-0 flex-1 space-y-10 overflow-y-auto p-6 lg:p-8"
      >
        {displayedMessages.length === 0 && !isSubmitting && (
          <div className="py-12 text-center">
            <span className="industrial-header text-[10px] tracking-[8px] text-[var(--color-text-muted)] opacity-40">
              AWAITING_INITIAL_PAYLOADS
            </span>
          </div>
        )}

        <div className="mx-auto max-w-4xl space-y-10">
          <AnimatePresence>
            {displayedMessages.map((message, index) => {
              const isWinningUserPrompt =
                message.type === 'user' && displayedMessages[index + 1]?.isSuccess === true
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  agent={agent}
                  senderProfile={userProfilesMap?.[message.sender?.toLowerCase()] || null}
                  isWinningPrompt={isWinningUserPrompt}
                  hideSuccessBanner
                  onShowJury={() => message.juryResponse && onShowJury(message.juryResponse)}
                />
              )
            })}

            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]">
                    <Image
                      src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
                      width={32}
                      height={32}
                      alt="sentinel"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
                    SENTINEL_PROCESSING...
                  </div>
                </div>
                <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-6">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                  <span className="font-mono text-xs uppercase text-[var(--color-text-muted)]">
                    Analyzing breach attempt...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
