'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle,
  Database,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import { useRecentEvidence } from '@/hooks/evidence/useRecentEvidence'
import { isValidBlobId, normalizeBlobId } from '@/lib/evidence'
import { truncateAddress } from '@/lib/utils'

export function EvidenceExplorer() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { data, isLoading, isError } = useRecentEvidence()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const blobId = normalizeBlobId(query)
    if (!isValidBlobId(blobId)) {
      setError('That does not look like a Walrus blob id (URL-safe base64).')
      return
    }
    setError(null)
    router.push(`/evidence/${blobId}`)
  }

  return (
    <div className="space-y-8">
      {/* Blob lookup */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <Search className="h-4 w-4 text-[var(--color-gold-primary)]" />
          VERIFY_AN_EVIDENCE_BLOB
        </h2>
        <p className="mt-2 text-xs text-[var(--color-text-muted)] md:text-sm">
          Paste a Walrus blob id (or an evidence link) to read the record straight from Walrus and
          render it here — no wallet, no Sui node required.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="e.g. 4cmHfMO…  (43-character blob id)"
            spellCheck={false}
            className="min-h-11 flex-1 rounded-none border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 font-mono text-xs text-white outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold-primary)] md:text-sm"
          />
          <button
            type="submit"
            className="industrial-header inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--color-border-default)] bg-white px-5 text-xs text-black transition-colors hover:bg-[var(--color-gold-primary)]"
          >
            <ShieldCheck className="h-4 w-4" />
            VERIFY
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      {/* On-chain evidence counter */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
          <div className="industrial-label">EVIDENCE BLOBS STORED</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-gold-primary)]" />
            ) : isError ? (
              '—'
            ) : (
              (data?.total ?? 0).toLocaleString()
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Permanent records certified on Walrus
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
          <div className="industrial-label">STORAGE NETWORK</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">
            Walrus
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Blob data on Walrus, anchors on Sui
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
          <div className="industrial-label">VERIFICATION</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">
            Public
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Anyone can read and verify, wallet-free
          </p>
        </div>
      </section>

      {/* Recent evidence feed */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <Database className="h-4 w-4 text-[var(--color-gold-primary)]" />
          RECENT_EVIDENCE
        </h2>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          The latest certified attack records stored permanently on Walrus.
        </p>

        {isLoading ? (
          <div className="space-y-3 pt-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-[var(--color-bg-elevated)]"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="pt-5 text-center text-sm text-[var(--color-text-muted)]">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
            Could not load the evidence feed right now. Try again shortly.
          </div>
        ) : !data || data.records.length === 0 ? (
          <div className="pt-5 text-center text-sm text-[var(--color-text-muted)]">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
            No evidence blobs certified yet. Breach a Sentinel to mint the first permanent record.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {data.records.map(record => (
              <a
                key={record.blob_id}
                href={`/evidence/${record.blob_id}`}
                className="block rounded-lg border-l-4 border-l-[var(--color-gold-primary)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-bg-hover,var(--color-bg-elevated))]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {record.success === null ? (
                        <AlertCircle className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                      ) : record.success ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-[var(--color-success,#4ade80)]" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                      )}
                      <span
                        className={`text-xs font-semibold ${record.success ? 'text-[var(--color-success,#4ade80)]' : 'text-[var(--color-text-muted)]'}`}
                      >
                        {record.success ? 'Breach confirmed' : 'Attack repelled'}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Sentinel #{record.sentinel_id}
                      </span>
                      {record.attacker_address && (
                        <span className="font-mono text-xs text-[var(--color-text-muted)]">
                          {truncateAddress(record.attacker_address)}
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(record.created_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-mono text-xs text-[var(--color-text-muted)]">
                      blob: {record.blob_id}
                    </p>
                  </div>
                  <span className="industrial-header flex shrink-0 items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                    VIEW_EVIDENCE
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
