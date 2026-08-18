'use client'

import { useEffect, useRef } from 'react'

import type { VoiceTurn } from '@/types/voice'
import { SentinelVoiceTurnBubble } from './SentinelVoiceTurnBubble'

interface SentinelVoiceTranscriptProps {
  turns: VoiceTurn[]
  sentinelName: string
}

export function SentinelVoiceTranscript({ turns, sentinelName }: SentinelVoiceTranscriptProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [turns])

  if (turns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="industrial-header text-center text-[10px] tracking-widest text-[var(--color-text-faint)]">
          TRANSCRIPT_EMPTY
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className="ios-scroll terminal-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-2"
    >
      {turns.map(turn => (
        <SentinelVoiceTurnBubble key={turn.id} turn={turn} sentinelName={sentinelName} />
      ))}
    </div>
  )
}
