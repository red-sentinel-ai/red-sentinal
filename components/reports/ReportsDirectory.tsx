'use client'

import Link from 'next/link'
import { FileText, Loader2, ShieldCheck } from 'lucide-react'

import { useSecurityReports } from '@/hooks/reports/useSecurityReports'

function formatScore(score: number | null): string {
  if (score === null) return '—'
  return `${Math.round(score * 100)}`
}

export function ReportsDirectory() {
  const { data, isLoading, isError } = useSecurityReports()

  return (
    <div className="space-y-6">
      {/* Counters */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
          <div className="industrial-label">SECURITY REPORTS GENERATED</div>
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
            Aggregate reports stored on the platform, one per active Sentinel
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
          <div className="industrial-label">SCORE METHOD</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">
            resistance-v1
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            70% breach resistance + 30% graded jury pressure, 0–100
          </p>
        </div>
      </section>

      {/* Directory */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--color-text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-gold-primary)]" />
            Loading security reports…
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-[var(--color-text-muted)]">
            Reports are temporarily unavailable — try again shortly.
          </div>
        ) : (data?.reports.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--color-text-muted)]">
            No security reports generated yet.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {(data?.reports ?? []).map(report => (
              <li key={report.sentinel_id}>
                <Link
                  href={`/reports/${report.sentinel_id}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--color-bg-base)] md:p-5"
                >
                  <div className="min-w-0">
                    <div className="industrial-header flex items-center gap-2 text-sm text-white">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--color-gold-primary)]" />
                      <span className="truncate">{report.sentinel_name}</span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                        #{report.sentinel_id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {report.total_attacks.toLocaleString()} attacks ·{' '}
                      {report.evidence_blob_count.toLocaleString()} evidence blobs · generated{' '}
                      {new Date(report.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div className="industrial-label">SCORE</div>
                      <div className="font-display text-xl font-extrabold text-white">
                        {formatScore(report.score)}
                        {report.score !== null && (
                          <span className="text-xs text-[var(--color-text-muted)]">/100</span>
                        )}
                      </div>
                    </div>
                    <ShieldCheck className="h-4 w-4 text-[var(--color-gold-primary)]" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-[var(--color-text-muted)]">
        Every report aggregates only certified evidence records — each claim links back to the raw{' '}
        <Link href="/evidence" className="text-[var(--color-gold-primary)] hover:text-white">
          evidence blob on Walrus
        </Link>
        , verifiable by anyone without a wallet.
      </p>
    </div>
  )
}
