'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame, Star } from 'lucide-react'

import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { getTokenForCoinType } from '@/constants'
import { CHAINS } from '@/constants/chains'
import { TokenAmount } from '@/components/ui/common/TokenAmount'
import { cn } from '@/lib/utils'

type Variant = 'featured' | 'trending'

export function SentinelMiniCard({
  agent,
  variant,
}: {
  agent: AgentDetails
  variant?: Variant
}) {
  const token = getTokenForCoinType(agent.coin_type)
  const chain = CHAINS[agent.chain ?? 'sui']

  return (
    <Link
      href={`/attack/${agent.agent_path}`}
      className="group block w-[230px] shrink-0 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-default)] hover:shadow-[var(--shadow-elevated)] sm:w-[250px]"
    >
      <div className="relative h-32 w-full overflow-hidden bg-[var(--color-bg-subtle)]">
        {agent.agent_image ? (
          <Image
            src={agent.agent_image}
            alt={agent.agent_name ?? 'Sentinel'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="250px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-[var(--color-text-muted)]">
            {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        {variant && (
          <span
            className={cn(
              'absolute left-2 top-2 inline-flex items-center rounded-full p-1',
              variant === 'featured'
                ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                : 'border border-amber-400/30 bg-amber-900/20 text-amber-400'
            )}
          >
            {variant === 'featured' ? (
              <Star className="h-3 w-3 fill-current" />
            ) : (
              <Flame className="h-3 w-3" />
            )}
          </span>
        )}

        <span className="absolute right-2 top-2 z-20 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/80 p-1">
          <Image
            src={chain.icon}
            alt={chain.name}
            width={14}
            height={14}
            className="shrink-0 rounded-full"
          />
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-center">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {agent.agent_name}
          </h3>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              Prize Pool
            </p>
            <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              <TokenAmount rawAmount={agent.total_balance} token={token} precision={2} iconSize={12} />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
              Cost
            </p>
            <div className="truncate text-sm text-[var(--color-text-secondary)]">
              <TokenAmount rawAmount={agent.cost_per_message} token={token} precision={2} iconSize={12} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex h-8 w-full items-center justify-center rounded-lg bg-[var(--color-gold-primary)] text-xs font-semibold text-[var(--color-text-on-gold)] opacity-0 transition-all duration-200 group-hover:bg-[var(--color-gold-light)] group-hover:opacity-100">
          Attack Sentinel
        </div>
      </div>
    </Link>
  )
}
