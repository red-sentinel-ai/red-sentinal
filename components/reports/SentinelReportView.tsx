'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  Copy,
  Database,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

import { useSentinelReport } from '@/hooks/reports/useSecurityReports'
import { getWalrusScanUrl } from '@/lib/evidence'
import { getWalrusBlobUrl } from '@/lib/explorer'
import { formatClassificationLabel } from '@/lib/reports'

const EVIDENCE_PREVIEW_COUNT = 50

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5">
      <div className="industrial-label">{label}</div>
      <div className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">{value}</div>
      {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  )
}

export function SentinelReportView({ sentinelId }: { sentinelId: number }) {
  const { data, isLoading, isError, error } = useSentinelReport(sentinelId)
  const report = data?.report
  const walrus = data?.walrus ?? null
  const [copied, setCopied] = useState(false)
  const [showAllEvidence, setShowAllEvidence] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-12 text-sm text-[var(--color-text-muted)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--color-gold-primary)]" />
        Loading security report… first views are generated on demand and may take a few seconds.
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8 text-sm text-[var(--color-text-muted)]">
        <AlertCircle className="h-4 w-4 text-red-400" />
        {error instanceof Error ? error.message : 'This report is unavailable right now.'}
      </div>
    )
  }

  const { attackSummary, securityScore, evidenceBlobIds } = report
  const scoreDisplay =
    securityScore.value === null ? 'N/A' : `${Math.round(securityScore.value * 100)}/100`
  const classifications = Object.entries(attackSummary.classifications).sort(
    ([, a], [, b]) => b.total - a.total
  )
  const visibleEvidence = showAllEvidence
    ? evidenceBlobIds
    : evidenceBlobIds.slice(0, EVIDENCE_PREVIEW_COUNT)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(report.shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="industrial-label">SECURITY REPORT · SENTINEL #{report.sentinelId}</div>
          <h1 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            {report.sentinelName}
          </h1>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Generated {new Date(report.generatedAt).toLocaleString()} · {report.network} · report
            v{report.reportVersion}
          </p>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="industrial-header inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--color-border-default)] bg-white px-5 text-xs text-black transition-colors hover:bg-[var(--color-gold-primary)]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'LINK_COPIED' : 'COPY_SHARE_LINK'}
        </button>
      </section>

      {/* Score + outcomes */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="SECURITY SCORE"
          value={scoreDisplay}
          hint={
            securityScore.insufficientData
              ? 'No attacks recorded yet'
              : `Method: ${securityScore.method}`
          }
        />
        <StatCard label="TOTAL ATTACKS" value={attackSummary.totalAttacks.toLocaleString()} />
        <StatCard
          label="BREACHES"
          value={attackSummary.breaches.toLocaleString()}
          hint="Attacks the jury ruled successful"
        />
        <StatCard
          label="REPELLED / HELD"
          value={`${attackSummary.repelled.toLocaleString()} / ${attackSummary.held.toLocaleString()}`}
          hint="Fully repelled / held under pressure"
        />
      </section>

      {/* Report on Walrus */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <Database className="h-4 w-4 text-[var(--color-gold-primary)]" />
          REPORT_ON_WALRUS
        </h2>
        {walrus ? (
          <>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              This exact report is saved on Walrus. It cannot be changed after it is stored, and
              storage is paid through Walrus epoch {walrus.endEpoch}.
            </p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="break-all font-mono text-xs text-white">{walrus.blobId}</span>
              <div className="flex shrink-0 items-center gap-4">
                <a
                  href={getWalrusScanUrl(walrus.blobId, walrus.network)}
                  target="_blank"
                  rel="noreferrer"
                  className="industrial-header inline-flex items-center gap-1 text-xs text-[var(--color-gold-primary)] hover:text-white"
                >
                  VIEW_ON_WALRUSCAN <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={getWalrusBlobUrl(walrus.blobId)}
                  target="_blank"
                  rel="noreferrer"
                  className="industrial-header inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-white"
                >
                  RAW_REPORT <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            This report has not been saved to Walrus yet. The evidence records below are already
            on Walrus and can be checked today.
          </p>
        )}
      </section>

      {/* Classifications */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <ShieldAlert className="h-4 w-4 text-[var(--color-gold-primary)]" />
          ATTACK_CLASSIFICATIONS
        </h2>
        {classifications.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">No attacks to classify yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {classifications.map(([label, stat]) => {
              const share = attackSummary.totalAttacks
                ? (stat.total / attackSummary.totalAttacks) * 100
                : 0
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white">{formatClassificationLabel(label)}</span>
                    <span className="font-mono text-[var(--color-text-muted)]">
                      {stat.total} attacks · {stat.breached} breached · {stat.repelled} repelled
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-[var(--color-bg-base)]">
                    <div
                      className="h-full bg-[var(--color-gold-primary)]"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Evidence index */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <Database className="h-4 w-4 text-[var(--color-gold-primary)]" />
          EVIDENCE_INDEX ({evidenceBlobIds.length.toLocaleString()} BLOBS)
        </h2>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {evidenceBlobIds.length.toLocaleString()} of{' '}
          {attackSummary.totalAttacks.toLocaleString()} attacks have their own evidence record on
          Walrus. Open any of them to read the attack prompt, the Sentinel&apos;s reply and the
          jury&apos;s verdict.
        </p>
        {evidenceBlobIds.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            No certified evidence blobs yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-border-subtle)]">
            {visibleEvidence.map(blobId => (
              <li key={blobId} className="flex items-center justify-between gap-3 py-2">
                <Link
                  href={`/evidence/${blobId}`}
                  className="truncate font-mono text-xs text-white hover:text-[var(--color-gold-primary)]"
                >
                  {blobId}
                </Link>
                <a
                  href={getWalrusScanUrl(blobId, report.network)}
                  target="_blank"
                  rel="noreferrer"
                  className="industrial-header inline-flex shrink-0 items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-white"
                >
                  WALRUSCAN <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
        {evidenceBlobIds.length > EVIDENCE_PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setShowAllEvidence(value => !value)}
            className="industrial-header mt-4 text-xs text-[var(--color-gold-primary)] hover:text-white"
          >
            {showAllEvidence
              ? 'SHOW_LESS'
              : `SHOW_ALL_${evidenceBlobIds.length.toLocaleString()}_BLOBS`}
          </button>
        )}
      </section>

      {/* Verification */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 text-xs text-[var(--color-text-muted)] md:p-6 md:text-sm">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <ShieldCheck className="h-4 w-4 text-[var(--color-gold-primary)]" />
          HOW_TO_VERIFY
        </h2>
        <p className="mt-2">
          You do not need a wallet or any Sui setup to check this report.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {walrus && (
            <li>
              Open the report on Walruscan using the link above. That is the same report you see on
              this page, stored where nobody can edit it.
            </li>
          )}
          <li>
            Open a few evidence records from the list. Each one shows what the attacker sent, how
            the Sentinel answered and what the jury decided.
          </li>
          <li>
            Count the breaches in those records and compare them with the numbers on this page.
          </li>
        </ol>
        <p className="mt-3">
          Attack categories are added by Red Sentinel when the report is created. They are not
          part of the evidence records yet, so they cannot be recounted from Walrus.
        </p>
        <p className="mt-3">
          The score runs from 0 to 100. Most of it (70%) comes from how often attacks failed to
          breach the Sentinel. The rest (30%) comes from how little progress attackers made,
          according to the jury. A score of 100 means no breaches and no progress at all.
        </p>
      </section>
    </div>
  )
}
