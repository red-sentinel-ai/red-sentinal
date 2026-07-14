'use client'

import { Brain } from 'lucide-react'

import { useSentinelMemories } from '@/hooks/agents/useSentinelMemories'

/**
 * Owner-only view of a sentinel's Walrus memories (prompts that have breached
 * it before). Renders nothing for non-owners — the hook returns `null` when the
 * backend refuses the request — so live exploits are never shown to attackers.
 */
export function SentinelMemoryPanel({
  network,
  sentinelId,
}: {
  network: string
  sentinelId: number
}) {
  const { data, isPending } = useSentinelMemories(network, sentinelId)

  // Hidden while loading, for non-owners (data === null), or when memory is off.
  if (isPending || !data || !data.enabled) return null

  const { memories } = data

  return (
    <div>
      <p className="industrial-header mb-2 flex items-center gap-1.5 text-[10px] text-accent">
        <Brain className="h-3 w-3" />
        DEFENSIVE_MEMORY
      </p>
      <div className="border border-[var(--color-border-default)] bg-white/[0.02] p-3">
        {memories.length === 0 ? (
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
            No breaches remembered yet. When an attacker defeats this sentinel,
            the winning prompt is stored on Walrus and recalled to help it resist
            next time.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {memories.map((memory, index) => (
              <li
                key={index}
                className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]"
              >
                {memory.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
