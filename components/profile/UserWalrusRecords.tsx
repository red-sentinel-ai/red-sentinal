'use client'

import { AlertCircle, CheckCircle, Database, ExternalLink, XCircle } from 'lucide-react'

import { useWalrusRecords } from '@/hooks/profile/useWalrusRecords'
import { truncateAddress } from '@/lib/utils'

export const UserWalrusRecords = () => {
  const { data: records, isLoading } = useWalrusRecords()

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[var(--color-text-muted)]">
        <Database className="mx-auto mb-4 h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
        Loading your Walrus records...
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)]">
          <Database className="h-5 w-5 text-[var(--color-gold-primary)]" />
          Walrus Records
        </h2>
        <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 opacity-50" />
          No attack records stored on Walrus yet. Breach a sentinel to mint your
          first permanent record — owned by your wallet.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text-primary)]">
        <Database className="h-5 w-5 text-[var(--color-gold-primary)]" />
        Walrus Records
        <span className="text-sm font-normal text-[var(--color-text-muted)]">
          ({records.length})
        </span>
      </h2>

      <div className="space-y-4">
        {records.map(record => (
          <div
            key={record.attack_id}
            className="rounded-lg border-l-4 border-l-[var(--color-gold-primary)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {record.success ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-[var(--color-success,#4ade80)]" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                  )}
                  <span
                    className={`text-xs font-semibold ${record.success ? 'text-[var(--color-success,#4ade80)]' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {record.success ? 'Attack succeeded' : 'Attack recorded'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Sentinel #{record.sentinel_id}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(record.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="mt-2 truncate font-mono text-xs text-[var(--color-text-muted)]">
                  blob: {truncateAddress(record.blob_id)}
                </p>
              </div>
              <a
                href={`/evidence/${record.blob_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="industrial-header flex shrink-0 items-center gap-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)] hover:text-white"
              >
                SEE_ON_WALRUS
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
