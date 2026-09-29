'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, Database, Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { RagDocumentInventory } from '@/components/rag/RagDocumentInventory'
import { useAdminSentinels } from '@/hooks/rag/useAdminSentinels'
import { RagApiError } from '@/lib/rag/rag-api'

const SUPPORTED_NETWORKS = ['mainnet', 'testnet'] as const

/**
 * Live-Sentinel RAG content management (`/defend/rag`). Administrators pick a
 * live Sentinel and manage the knowledge documents it retrieves during
 * attacks. Selection is reflected in the URL (`?network=&sentinel_id=`) so a
 * specific Sentinel's view can be shared or bookmarked.
 */
export default function RagContentPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const networkParam = searchParams.get('network')
  const sentinelIdParam = searchParams.get('sentinel_id')

  const [network, setNetwork] = useState<string>(networkParam ?? SUPPORTED_NETWORKS[0])
  const [sentinelId, setSentinelId] = useState<number | null>(
    sentinelIdParam ? Number(sentinelIdParam) || null : null
  )

  const {
    data: sentinels,
    isPending: sentinelsPending,
    isError: sentinelsLoadFailed,
    error: sentinelsError,
    refetch: refetchSentinels,
  } = useAdminSentinels(network)

  const selectedSentinel = useMemo(
    () => sentinels?.find(sentinel => sentinel.sentinel_id === sentinelId) ?? null,
    [sentinels, sentinelId]
  )

  // Keep the URL in sync so the view is deep-linkable.
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('network', network)
    if (sentinelId) params.set('sentinel_id', String(sentinelId))
    router.replace(`/defend/rag?${params.toString()}`)
  }, [network, sentinelId, router])

  const sentinelName = selectedSentinel?.name

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-[var(--color-accent)]">
          <BookOpen className="size-5" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Live Sentinel administration
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">
          RAG content management
        </h1>
        <p className="max-w-3xl text-sm text-[var(--color-text-muted)] sm:text-base">
          Manage the knowledge documents a live Sentinel retrieves during attacks. Content is
          indexed into one shared index, isolated by this Sentinel&apos;s namespace.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="rag-network-select" className="text-sm text-[var(--color-text-muted)]">
              Network
            </label>
            <select
              id="rag-network-select"
              value={network}
              onChange={event => {
                setNetwork(event.target.value)
                setSentinelId(null)
              }}
              className="h-10 w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 text-sm text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
            >
              {SUPPORTED_NETWORKS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rag-sentinel-select" className="text-sm text-[var(--color-text-muted)]">
              Live Sentinel
            </label>
            {sentinelsPending ? (
              <Skeleton className="h-10 w-full" />
            ) : sentinelsLoadFailed ? (
              <div className="border-[var(--color-danger)]/30 flex items-center justify-between gap-2 rounded-md border bg-[var(--color-danger-muted)] px-3 py-2 text-sm text-[var(--color-danger)]">
                <span className="truncate">
                  {sentinelsError instanceof RagApiError
                    ? sentinelsError.message
                    : 'Failed to load sentinels.'}
                </span>
                <button
                  type="button"
                  className="shrink-0 underline underline-offset-2"
                  onClick={() => refetchSentinels()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                id="rag-sentinel-select"
                value={sentinelId ?? ''}
                onChange={event =>
                  setSentinelId(event.target.value ? Number(event.target.value) : null)
                }
                className="h-10 w-full rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-deepest)] px-3 text-sm text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
              >
                <option value="">
                  {(sentinels?.length ?? 0) > 0
                    ? 'Select a sentinel…'
                    : 'No active sentinels on this network'}
                </option>
                {(sentinels ?? []).map(sentinel => (
                  <option key={sentinel.sentinel_id} value={sentinel.sentinel_id}>
                    #{sentinel.sentinel_id} — {sentinel.name}
                    {sentinel.rag_config?.enabled ? ' (RAG on)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      {!sentinelId && (
        <div className="space-y-2 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-8 text-center">
          <ShieldCheck className="mx-auto size-8 text-[var(--color-text-muted)]" />
          <p className="font-medium text-[var(--color-text-primary)]">
            Select a live Sentinel to manage its knowledge
          </p>
          <p className="mx-auto max-w-md text-sm text-[var(--color-text-muted)]">
            Each Sentinel can only retrieve the documents stored in its own namespace — content is
            never shared between Sentinels.
          </p>
        </div>
      )}

      {sentinelId && !selectedSentinel && sentinels && (
        <div className="border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-[var(--color-warning)]">
          <Database className="size-4 shrink-0" />
          Sentinel #{sentinelId} was not found among active sentinels on {network}. It may be
          inactive or on a different network.
        </div>
      )}

      {sentinelId && !selectedSentinel && sentinelsPending && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="size-4 animate-spin" />
          Loading sentinels…
        </div>
      )}

      {sentinelId && (
        <RagDocumentInventory
          network={network}
          sentinelId={sentinelId}
          sentinelName={sentinelName ?? undefined}
        />
      )}

      {sentinelId && sentinelsLoadFailed && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={() => refetchSentinels()}>
            <Loader2 className="mr-1.5 size-3.5" />
            Retry loading sentinel details
          </Button>
        </div>
      )}
    </div>
  )
}
