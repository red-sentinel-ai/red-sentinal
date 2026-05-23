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
  index = 0,
}: {
  agent: AgentDetails
  variant?: Variant
  index?: number
}) {
  const token = getTokenForCoinType(agent.coin_type)
  const chain = CHAINS[agent.chain ?? 'sui']
  const isFeatured = variant === 'featured'
  const isPrimaryFeatured = isFeatured && index === 0

  return (
    <Link
      href={`/attack/${agent.agent_path}`}
      className={cn(
        'group flex h-full min-w-0 flex-col overflow-hidden border bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--color-gold-primary)] hover:shadow-[var(--shadow-elevated)]',
        isPrimaryFeatured
          ? 'tactical-glow border-[var(--color-gold-primary)]'
          : 'border-[var(--color-border-default)]'
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden bg-[var(--color-bg-subtle)]',
          isFeatured ? 'h-44' : 'h-32'
        )}
      >
        {agent.agent_image ? (
          <Image
            src={agent.agent_image}
            alt={agent.agent_name ?? 'Sentinel'}
            fill
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0',
              isPrimaryFeatured ? 'grayscale-0' : 'grayscale'
            )}
            sizes="250px"
          />
        ) : (
          <div className="font-display flex h-full items-center justify-center text-3xl font-bold text-[var(--color-text-muted)]">
            {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
        {variant && (
          <span
            className={cn(
              'absolute left-2 top-2 inline-flex items-center gap-1 px-2 py-1 font-mono text-[9px] font-bold uppercase leading-none',
              variant === 'featured'
                ? 'bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                : 'bg-[var(--color-gold-light)] text-[var(--color-accent-fg)]'
            )}
          >
            {variant === 'featured' ? (
              <Star className="h-2.5 w-2.5" />
            ) : (
              <Flame className="h-2.5 w-2.5" />
            )}
            {variant === 'featured' ? 'Featured' : 'Trending'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate font-mono text-sm font-bold uppercase tracking-[0.02em] text-[var(--color-text-primary)]">
            {agent.agent_name}
          </h3>
          <Image
            src={chain.icon}
            alt={chain.name}
            width={16}
            height={16}
            className="mt-0.5 shrink-0 rounded-full"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              Prize Pool
            </p>
            <div className="truncate font-mono text-xs font-bold text-[var(--color-gold-light)]">
              <TokenAmount
                rawAmount={agent.total_balance}
                token={token}
                precision={2}
                iconSize={12}
              />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
              Cost
            </p>
            <div className="truncate font-mono text-xs font-bold text-[var(--color-text-primary)]">
              <TokenAmount
                rawAmount={agent.cost_per_message}
                token={token}
                precision={2}
                iconSize={12}
              />
            </div>
          </div>
        </div>

        {isPrimaryFeatured ? (
          <div className="mt-auto flex h-10 w-full items-center justify-center bg-[var(--color-gold-primary)] font-mono text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-text-on-gold)] transition-all group-hover:bg-[var(--color-gold-light)] group-active:scale-[0.98]">
            Attack Sentinel
          </div>
        ) : (
          <div className="mt-auto h-0" />
        )}
      </div>
    </Link>
  )
}
