'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { generateAvatarUrl } from '@/lib/utils'
import type { Agent } from '@/types/agents'
import type { ChatMessage as ChatMessageType } from './ChatInterface'
import { ChatMessage } from './ChatMessage'

interface CasualMessageFeedProps {
  agent: Agent
  messages: ChatMessageType[]
  isSubmitting: boolean
}

export function CasualMessageFeed({ agent, messages, isSubmitting }: CasualMessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSubmitting])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="hidden h-12 shrink-0 items-center border-b border-[var(--color-border-strong)] px-6 md:flex lg:px-8">
        <span className="industrial-header text-[11px] tracking-widest text-white">
          CASUAL_CHAT
        </span>
        <span className="industrial-header ml-auto text-[9px] tracking-[4px] text-[var(--color-text-muted)]/60">
          FREE // OFF-CHAIN
        </span>
      </div>

      <div
        ref={scrollRef}
        className="terminal-scrollbar min-h-0 flex-1 space-y-10 overflow-y-auto p-6 lg:p-8"
      >
        {messages.length === 0 && !isSubmitting && (
          <div className="py-12 text-center">
            <span className="industrial-header text-[10px] tracking-[8px] text-[var(--color-text-muted)] opacity-40">
              START_A_CONVERSATION
            </span>
          </div>
        )}

        <div className="mx-auto max-w-4xl space-y-10">
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
