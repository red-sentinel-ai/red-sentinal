'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn, generateAvatarUrl } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { ChatMessage } from './ChatMessage'

interface CasualMessageFeedProps {
  agent: Agent
  messages: ChatMessageType[]
  isSubmitting: boolean
  className?: string
}

export function CasualMessageFeed({
  agent,
  messages,
  isSubmitting,
  className,
}: CasualMessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSubmitting])

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="chat-toolbar hidden md:flex">
        <span className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-white">
          CASUAL_CHAT
        </span>
        <span className="industrial-header text-[var(--color-text-muted)]/60 ml-auto text-[10px] font-semibold tracking-[0.06em]">
          FREE // OFF-CHAIN
        </span>
      </div>

      <div ref={scrollRef} className="chat-feed terminal-scrollbar">
        {messages.length === 0 && !isSubmitting && (
          <div className="py-8 text-center sm:py-10">
            <span className="chat-feed-notice industrial-header">START_A_CONVERSATION</span>
          </div>
        )}

        <div className="chat-feed-stack">
          <AnimatePresence>
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                agent={agent}
                senderProfile={null}
                hideSuccessBanner
              />
            ))}

            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] sm:h-8 sm:w-8">
                    <Image
                      src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
                      width={32}
                      height={32}
                      alt="sentinel"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="industrial-header text-[10px] font-medium tracking-[0.06em] text-[var(--color-text-muted)] sm:text-[11px]">
                    SENTINEL_PROCESSING...
                  </div>
                </div>
                <div className="border-hairline flex items-center gap-3 bg-[var(--color-bg-elevated)] p-3 sm:p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                  <span className="font-mono text-xs tracking-normal text-[var(--color-text-muted)]">
                    Thinking…
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
