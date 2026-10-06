'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL, SUI_SENTINEL_APP_URL } from '@/constants'
import { CHAINS } from '@/constants/chains'
import type { Agent } from '@/types/agents'
import type { SentinelAttribution } from '@/types/share'
import { buildSharePost } from '@/lib/share'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { cn } from '@/lib/utils'

interface AttackShareCardProps {
  agent: Agent
  success: boolean
  score: number
  /** The prompt the attacker submitted. */
  prompt: string
  /** The Sentinel's reply (explanation) for that prompt. */
  reply: string
  /** On-chain Attack nonce (Sui) — resolves the attack id for the share URL's OG image. */
  attackNonce?: string | null
}

async function fetchSentinelAttribution(agentId: string): Promise<SentinelAttribution | null> {
  const response = await fetch(`/api/agents/attribution?agentId=${encodeURIComponent(agentId)}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) return null
  return (data.attribution ?? null) as SentinelAttribution | null
}

/**
 * The TEE never surfaces the attack id, so it is resolved from the on-chain
 * nonce via the backend lookup (same mechanism as the Walrus record flow).
 * Sui-only today: the lookup's network string is the Sui one.
 */
async function resolveAttackId(nonce: string, attackerAddress: string): Promise<string | null> {
  const params = new URLSearchParams({
    network: `sui-${APP_NETWORK}`,
    nonce,
    attacker_address: attackerAddress,
  })
  const response = await fetch(`/api/sentinels/attack-by-nonce?${params}`)
  if (!response.ok) return null
  const data = await response.json().catch(() => ({}))
  return typeof data.attack_id === 'string' ? data.attack_id : null
}

/**
 * Post-attack share block: previews the exact OG card X will render and opens
 * an editable X post linking back to this Sentinel's challenge page. The card
 * image comes from the backend renderer; without an attack id (non-Sui
 * chains, lookup failure) only the share button remains.
 */
export function AttackShareCard({ agent, success, score, prompt, reply, attackNonce }: AttackShareCardProps) {
  const { address: attackerAddress } = useConnectedAddress()
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)

  const { data: attribution } = useQuery({
    queryKey: ['sentinel-attribution', agent.agent_id],
    queryFn: () => fetchSentinelAttribution(agent.agent_id),
    enabled: !!agent.agent_id,
    staleTime: 5 * 60_000,
  })

  const { data: attackId } = useQuery({
    queryKey: ['attack-id-by-nonce', attackNonce, attackerAddress],
    queryFn: () => resolveAttackId(attackNonce!, attackerAddress!),
    enabled: !!attackNonce && !!attackerAddress && agent.chain === 'sui',
    staleTime: Infinity,
    retry: 1,
  })

  const sentinelName = agent.agent_name || 'the Sentinel'
  const chainName = agent.chain ? (CHAINS[agent.chain]?.name ?? 'on-chain') : 'on-chain'
  const challengeUrl = `${SUI_SENTINEL_APP_URL}/attack/${agent.agent_path}`
  // The ?a= param is what makes X's crawler render the per-attack jury card;
  // until the lookup lands the share still works with the banner fallback.
  const shareUrl = attackId ? `${challengeUrl}?a=${attackId}` : challengeUrl
  const cardUrl = attackId ? `${SUI_SENTINEL_API_URL}/sentinels/attack/image/${attackId}` : null

  const { text: shareText } = useMemo(
    () =>
      buildSharePost({
        sentinelName,
        success,
        score,
        chainName,
        challengeUrl: shareUrl,
        userPrompt: prompt,
        sentinelReply: reply,
        attribution,
      }),
    [sentinelName, success, score, chainName, shareUrl, prompt, reply, attribution]
  )

  const shareOnX = () => {
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=700'
    )
  }

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

      {cardUrl && (
        <div className="relative mt-3 aspect-[1200/630] overflow-hidden rounded-md border border-[var(--color-border-subtle)] bg-black/30">
          {loadedUrl !== cardUrl && (
            <div className="absolute inset-0 animate-pulse bg-white/5" aria-hidden />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardUrl}
            alt={`${sentinelName} — Red Sentinel jury card`}
            onLoad={() => setLoadedUrl(cardUrl)}
            className={cn('absolute inset-0 h-full w-full', loadedUrl !== cardUrl && 'opacity-0')}
          />
        </div>
      )}

      <button
        onClick={shareOnX}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-black py-2.5 text-sm font-bold text-white transition-colors hover:border-white/50"
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
