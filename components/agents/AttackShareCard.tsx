'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { SUI_SENTINEL_APP_URL } from '@/constants'
import { CHAINS } from '@/constants/chains'
import type { Agent } from '@/types/agents'
import type { SentinelAttribution, ShareFact } from '@/types/share'
import { buildSharePost } from '@/lib/share'
import { cn } from '@/lib/utils'

interface AttackShareCardProps {
  agent: Agent
  success: boolean
  score: number
  /** The prompt the attacker submitted. */
  prompt: string
  /** The Sentinel's reply (explanation) for that prompt. */
  reply: string
}

async function fetchActiveShareFacts(): Promise<ShareFact[]> {
  const response = await fetch('/api/share-facts')
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) return []
  return (data.facts ?? []) as ShareFact[]
}

async function fetchSentinelAttribution(agentId: string): Promise<SentinelAttribution | null> {
  const response = await fetch(`/api/agents/attribution?agentId=${encodeURIComponent(agentId)}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) return null
  return (data.attribution ?? null) as SentinelAttribution | null
}

/**
 * Post-attack share card: tells the player's jailbreak story and opens an
 * editable X post linking back to this Sentinel's challenge page. Purely
 * frontend — nothing is published or persisted server-side.
 */
export function AttackShareCard({ agent, success, score, prompt, reply }: AttackShareCardProps) {
  const { data: facts = [] } = useQuery({
    queryKey: ['share-facts'],
    queryFn: fetchActiveShareFacts,
    staleTime: 5 * 60_000,
  })

  const { data: attribution } = useQuery({
    queryKey: ['sentinel-attribution', agent.agent_id],
    queryFn: () => fetchSentinelAttribution(agent.agent_id),
    enabled: !!agent.agent_id,
    staleTime: 5 * 60_000,
  })

  const sentinelName = agent.agent_name || 'the Sentinel'
  const chainName = agent.chain ? (CHAINS[agent.chain]?.name ?? 'on-chain') : 'on-chain'
  const challengeUrl = `${SUI_SENTINEL_APP_URL}/attack/${agent.agent_path}`

  // One fact is drawn at random per render of the composed post; re-picking on
  // every keystroke is avoided by memoizing on the facts list itself.
  const { text: shareText, fact } = useMemo(
    () =>
      buildSharePost({
        sentinelName,
        success,
        score,
        chainName,
        challengeUrl,
        facts,
        attribution,
      }),
    [sentinelName, success, score, chainName, challengeUrl, facts, attribution]
  )

  const shareOnX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=700'
    )
  }

  const juryLine = success ? 'JURY · BREACH CONFIRMED' : 'JURY · DEFENSE HELD'

  return (
    <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-medium text-white">Share your run</h3>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
            success
              ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
              : 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
          )}
        >
          {success ? 'Verified Breach' : 'Attempt Failed'}
        </span>
      </div>

      <div className="mt-3 flex gap-3">
        {/* Story */}
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-sm font-semibold text-white">{sentinelName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Deployed on {chainName}</p>
          </div>

          {attribution?.org_description && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Deployed by {attribution.org_description}
              {attribution.org_x_handle ? (
                <>
                  {' · '}
                  <a
                    href={`https://x.com/${attribution.org_x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-1 underline-offset-2 hover:text-white"
                  >
                    @{attribution.org_x_handle}
                  </a>
                </>
              ) : null}
            </p>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Your prompt
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/60">
              {prompt || '—'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Sentinel&apos;s reply
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/60">
              {reply || '—'}
            </p>
          </div>

          {fact && (
            <div className="rounded-md border border-[var(--color-border-subtle)] bg-black/30 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-gold-primary)]">
                Did you know
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/60">{fact.fact}</p>
            </div>
          )}
        </div>

        {/* Vertical jury bar */}
        <div
          className={cn(
            'flex w-9 shrink-0 items-center justify-center rounded-md border',
            success
              ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/10'
              : 'border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10'
          )}
        >
          <span
            className={cn(
              'whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.18em]',
              '[writing-mode:vertical-rl] rotate-180',
              success ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
            )}
          >
            {juryLine} · {score}/100
          </span>
        </div>
      </div>

      <button
        onClick={shareOnX}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-black py-2.5 text-sm font-bold text-white transition-colors hover:border-white/50"
      >
        <Image src="/icons/x.svg" width={14} height={14} alt="" />
        Share on X
      </button>

      <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
        Opens a pre-filled post you can edit before publishing ·{' '}
        <Link
          href={`/attack/${agent.agent_path}`}
          target="_blank"
          className="underline decoration-1 underline-offset-2 hover:text-white"
        >
          challenge page
        </Link>
      </p>
    </div>
  )
}
