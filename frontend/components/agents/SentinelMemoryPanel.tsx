'use client'

import { Brain } from 'lucide-react'

import { useSentinelMemories } from '@/hooks/agents/useSentinelMemories'

export function SentinelMemoryPanel({
  network,
  sentinelId,
  className,
}: {
  network: string
  sentinelId: number
  /** Wrapper classes so each host controls its own section spacing. */
  className?: string
}) {
  const { data } = useSentinelMemories(network, sentinelId)

  if (!data || !data.enabled || data.memories.length === 0) return null

  return (
    <div className={className}>
      <p className="industrial-header mb-2 flex items-center gap-1.5 text-[10px] text-accent">
        <Brain className="h-3 w-3" />
        DEFENSIVE_MEMORY
      </p>
      <div className="border border-[var(--color-border-default)] bg-white/[0.02] p-3">
        <ul className="flex flex-col gap-2">
          {data.memories.map((memory, index) => (
            <li
              key={index}
              className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]"
            >
              {memory.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
