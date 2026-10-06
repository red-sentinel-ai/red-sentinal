'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import {
  APP_NETWORK,
  SUI_SENTINEL_API_URL,
  SUI_SENTINEL_APP_URL,
  SUI_SENTINEL_X_USERNAME,
} from '@/constants'
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
  /** On-chain Attack nonce (Sui) — resolves the attack id for the share card image. */
  attackNonce?: string | null
  /** Known attack id (e.g. from chat history) — skips the nonce lookup. */
  attackId?: string | null
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
 * Post-attack share block. The backend-rendered card IS the content: the
 * player copies the image (native image tweets carry best on X) plus a short
 * suggested post, and pastes both into X themselves. Without an attack id
 * (non-Sui chains, lookup failure) there is no image, so it falls back to the
 * classic pre-filled X intent post.
 */
export function AttackShareCard({
  agent,
  success,
  score,
  prompt,
  reply,
  attackNonce,
  attackId: knownAttackId,
}: AttackShareCardProps) {
  const { address: attackerAddress } = useConnectedAddress()
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [imageCopied, setImageCopied] = useState(false)
  const [imageCopyFailed, setImageCopyFailed] = useState(false)
  const [popupBlocked, setPopupBlocked] = useState(false)

  const { data: attribution } = useQuery({
    queryKey: ['sentinel-attribution', agent.agent_id],
    queryFn: () => fetchSentinelAttribution(agent.agent_id),
    enabled: !!agent.agent_id,
    staleTime: 5 * 60_000,
  })

  const { data: nonceAttackId } = useQuery({
    queryKey: ['attack-id-by-nonce', attackNonce, attackerAddress],
    queryFn: () => resolveAttackId(attackNonce!, attackerAddress!),
    enabled: knownAttackId == null && !!attackNonce && !!attackerAddress && agent.chain === 'sui',
    staleTime: Infinity,
    retry: 1,
  })
  const attackId = knownAttackId ?? nonceAttackId

  const sentinelName = agent.agent_name || 'the Sentinel'
  const chainName = agent.chain ? (CHAINS[agent.chain]?.name ?? 'on-chain') : 'on-chain'
  const challengeUrl = `${SUI_SENTINEL_APP_URL}/attack/${agent.agent_path}`
  // The ?a= param still pays off when the post ships without the image —
  // X's crawler then renders the per-attack jury card for the link.
  const shareUrl = attackId ? `${challengeUrl}?a=${attackId}` : challengeUrl
  const cardUrl = attackId ? `${SUI_SENTINEL_API_URL}/sentinels/attack/image/${attackId}` : null

  const suggestedPost = success
    ? `I broke ${sentinelName} on ${chainName}. I  ${score}/100, verified. Your move: ${shareUrl}  @${SUI_SENTINEL_X_USERNAME}`
    : `Tried to jailbreak ${sentinelName} on ${chainName}. it held (${score}/100). Find the crack: ${shareUrl}  @${SUI_SENTINEL_X_USERNAME}`

  /**
   * One click: card image to the clipboard, then the X composer opens with
   * the post pre-filled — the player just pastes (Ctrl/Cmd+V) and the image
   * ships natively in the tweet. Copy must finish before window.open: the
   * popup steals document focus, which fails the clipboard write. Both run
   * inside the click's transient activation (~5s), so the popup survives
   * the short await.
   */
  const shareOnX = async () => {
    if (!cardUrl) return
    try {
      const response = await fetch(cardUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setImageCopied(true)
      setTimeout(() => setImageCopied(false), 4000)
    } catch {
      setImageCopyFailed(true)
    }
    const win = window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(suggestedPost)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=700'
    )
    if (!win) setPopupBlocked(true)
  }

  // No image (non-Sui chain or failed lookup): pre-filled intent post as before.
  const fallbackShareOnX = () => {
    const { text } = buildSharePost({
      sentinelName,
      success,
      score,
      chainName,
      challengeUrl: shareUrl,
      userPrompt: prompt,
      sentinelReply: reply,
      attribution,
    })
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
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

      {cardUrl ? (
        <>
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

          <div className="mt-3 rounded-md border border-[var(--color-border-subtle)] bg-black/30 p-3">
            <p className="industrial-header text-[10px] font-bold tracking-[0.14em] text-[var(--color-gold-primary)]">
              HOW TO SHARE
            </p>
            <ol className="mt-2.5 space-y-2">
              {[
                'TAP SHARE ON X — THE CARD COPIES TO YOUR CLIPBOARD',
                'IN THE COMPOSER, PASTE THE IMAGE (CTRL/CMD+V)',
                'HIT POST — THE CARD SHIPS NATIVE IN YOUR TWEET',
              ].map((label, i) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="border-[var(--color-gold-primary)]/50 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold text-[var(--color-gold-primary)]">
                    {i + 1}
                  </span>
                  <span className="industrial-header text-[10px] font-medium leading-snug tracking-[0.06em] text-white/75">
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={shareOnX}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-black py-2.5 text-sm font-bold text-white transition-colors hover:border-white/50"
          >
            <Image src="/icons/x.svg" width={14} height={14} alt="" />
            Share on X
          </button>

          <p className="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
            {popupBlocked
              ? 'Pop-up blocked — the card image is copied; open x.com, paste it (Ctrl/Cmd+V) and post ·'
              : imageCopyFailed
                ? 'Clipboard blocked — right-click the card, “Copy image”, then paste it in the composer ·'
                : imageCopied
                  ? 'Card copied — paste it into the composer (Ctrl/Cmd+V) and post ·'
                  : 'Sharing copies the card — paste it into the composer (Ctrl/Cmd+V) and post ·'}
            <Link
              href={`/attack/${agent.agent_path}`}
              target="_blank"
              className="underline decoration-1 underline-offset-2 hover:text-white"
            >
              challenge page
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={fallbackShareOnX}
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
        </>
      )}
    </div>
  )
}
