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
  if (agents.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-4',
        variant === 'trending'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
      )}
      role="list"
    >
      {agents.map(agent => (
        <SentinelMiniCard key={agent.agent_id} agent={agent} variant={variant} />
      ))}
    </div>
  )
}
