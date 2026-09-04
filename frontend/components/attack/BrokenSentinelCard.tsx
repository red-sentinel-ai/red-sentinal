'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Skull } from 'lucide-react'

import { type Agent } from '@/types/agents'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS } from '@/constants/chains'
import { TokenAmount } from '@/components/ui/common/TokenAmount'
import { getExplorerTxUrl } from '@/lib/explorer'
import { truncateAddress } from '@/lib/utils'
import { finalPool } from '@/hooks/agents/useDefeatedAgents'

/** Card for a broken sentinel — social proof that pools get claimed. The final
 *  pool is the winner's payout (the on-chain balance is drained after a win). */
export function BrokenSentinelCard({ agent }: { agent: Agent }) {
  const token = getTokenForCoinType(agent.coin_type, agent.chain)
  const chain = CHAINS[agent.chain ?? 'sui']
  const winnerAddress = agent.winner?.address
  const txDigest = agent.winner?.tx_digest

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)] transition-colors hover:border-white/45">
      <div className="relative h-28 w-full overflow-hidden bg-[var(--color-bg-subtle)] sm:h-36">
        {agent.agent_image ? (
          <Image
            src={agent.agent_image}
            alt={agent.agent_name ?? 'Sentinel'}
            fill
            className="scale-105 object-cover opacity-60 grayscale transition-all duration-700 group-hover:scale-100 sm:opacity-70"
            sizes="320px"
          />
        ) : (
          <div className="font-display flex h-full items-center justify-center text-3xl font-extrabold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="from-[var(--color-bg-deepest)]/80 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <span className="font-body border-[var(--color-danger)]/40 absolute left-3 top-3 inline-flex items-center gap-1 border bg-[var(--color-bg-deepest)] px-2 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-danger)] sm:left-4 sm:top-4 sm:px-3">
          <Skull className="h-2.5 w-2.5" />
          Defeated
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-4 flex items-start gap-2 sm:mb-6">
          <h3 className="font-display min-w-0 flex-1 truncate text-base font-bold uppercase tracking-[0.04em] text-white sm:text-lg">
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

        <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-5 sm:gap-4">
          <div className="min-w-0">
            <p className="font-body mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Pool Claimed
            </p>
            <div className="font-display truncate text-sm font-semibold uppercase tracking-[0.04em] text-white">
              <TokenAmount rawAmount={finalPool(agent)} token={token} precision={2} iconSize={12} />
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="font-body mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)]">
              Attacks Survived
            </p>
            <div className="font-display truncate text-sm font-semibold uppercase tracking-[0.04em] text-white">
              {agent.total_attacks}
            </div>
          </div>
        </div>

        <div className="font-body mb-5 flex min-h-8 items-center gap-2 border-t border-[var(--color-border-default)] pt-3 text-[11px] font-medium tracking-normal sm:mb-6">
          <span className="shrink-0 uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
            Winner:
          </span>
          {winnerAddress ? (
            <span>{truncateAddress(winnerAddress)}</span>
          ) : (
            <span className="truncate text-[var(--color-text-muted)]">Unknown</span>
          )}
          {txDigest && (
            <a
              href={getExplorerTxUrl(txDigest, agent.chain ?? 'sui')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View payout transaction"
              className="ml-auto inline-flex shrink-0 items-center gap-1 text-[var(--color-text-secondary)] transition-colors hover:text-white"
            >
              <ExternalLink className="size-3" />
              <span className="hidden sm:inline">tx</span>
            </a>
          )}
        </div>

        <Link
          href={`/attack/${agent.agent_path}`}
          className="font-body border-[var(--color-danger)]/50 mt-auto flex h-10 w-full items-center justify-center rounded-full border text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-danger)] transition-all hover:border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-black group-active:scale-[0.98] sm:h-11"
        >
          View Verdict
        </Link>
      </div>
    </div>
  )
}
