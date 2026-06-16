'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame, Star } from 'lucide-react'

import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS } from '@/constants/chains'
import { TokenAmount } from '@/components/ui/common/TokenAmount'

type Variant = 'featured' | 'trending'

export function SentinelMiniCard({ agent, variant }: { agent: AgentDetails; variant?: Variant }) {
  const token = getTokenForCoinType(agent.coin_type)
  const chain = CHAINS[agent.chain ?? 'sui']
  const label = variant === 'trending' ? 'Trending' : 'Featured'

  return (
    <Link
      href={`/attack/${agent.agent_path}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)] transition-colors hover:border-white/45"
    >
      <div className="relative h-48 w-full overflow-hidden bg-[var(--color-bg-subtle)]">
        {agent.agent_image ? (
          <Image
            src={agent.agent_image}
            alt={agent.agent_name ?? 'Sentinel'}
            fill
            className="scale-105 object-cover transition-all duration-700 group-hover:scale-100"
            sizes="250px"
          />
        ) : (
          <div className="font-display flex h-full items-center justify-center text-3xl font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="from-[var(--color-bg-deepest)]/80 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        {variant && (
          <span className="font-body absolute left-4 top-4 inline-flex items-center gap-1 bg-white px-3 py-1 text-[9px] font-extrabold uppercase leading-none tracking-[0.1em] text-black">
            {variant === 'featured' ? (
              <Star className="h-2.5 w-2.5" />
            ) : (
              <Flame className="h-2.5 w-2.5" />
            )}
            {label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6 flex items-start gap-2">
          <h3 className="font-display min-w-0 flex-1 truncate text-lg font-extrabold uppercase tracking-[0.04em] text-white">
            {agent.agent_name}
          </h3>
          <Image
            src={chain.icon}
            alt={chain.name}
            width={16}
            height={16}
            className={`mt-0.5 shrink-0 rounded-full ${chain.iconFilterClass}`}
          />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <p className="font-body mb-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Prize Pool
            </p>
            <div className="font-display truncate text-sm font-extrabold uppercase tracking-[0.04em] text-white">
              <TokenAmount
                rawAmount={agent.total_balance}
                token={token}
                precision={2}
                iconSize={12}
              />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-body mb-1 text-[8px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
              Attack Fee
            </p>
            <div className="font-display truncate text-sm font-extrabold uppercase tracking-[0.04em] text-white">
              <TokenAmount
                rawAmount={agent.cost_per_message}
                token={token}
                precision={2}
                iconSize={12}
              />
            </div>
          </div>
        </div>

        <div className="font-body mt-auto flex h-11 w-full items-center justify-center rounded-full border border-white text-[11px] font-extrabold uppercase tracking-[0.1em] text-white transition-all group-hover:bg-white group-hover:text-black group-active:scale-[0.98]">
          Attack Sentinel
        </div>
      </div>
    </Link>
  )
}
