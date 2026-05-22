'use client'

import { useEffect, useRef, useState } from 'react'

import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { cn } from '@/lib/utils'
import { SentinelMiniCard } from './SentinelMiniCard'

type Variant = 'featured' | 'trending'

export function SentinelMarquee({
  agents,
  variant,
}: {
  agents: AgentDetails[]
  variant?: Variant
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const group = groupRef.current
      if (!container || !group) return
      // Only loop when one copy of the cards is wider than the visible row.
      setAnimate(group.scrollWidth > container.clientWidth + 4)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [agents.length])

  if (agents.length === 0) return null

  // Slower for short lists, capped so long lists don't crawl.
  const durationSeconds = Math.min(80, Math.max(24, agents.length * 6))

  const Group = ({ hidden }: { hidden?: boolean }) => (
    <div ref={hidden ? undefined : groupRef} className="flex shrink-0" aria-hidden={hidden}>
      {agents.map(agent => (
        <div key={`${agent.agent_id}${hidden ? '-dup' : ''}`} className="pr-4">
          <SentinelMiniCard agent={agent} variant={variant} />
        </div>
      ))}
    </div>
  )

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
      role="list"
    >
      <div
        className={cn('flex w-max', animate && 'marquee-track')}
        style={animate ? { animationDuration: `${durationSeconds}s` } : undefined}
      >
        <Group />
        {animate && <Group hidden />}
      </div>
    </div>
  )
}
