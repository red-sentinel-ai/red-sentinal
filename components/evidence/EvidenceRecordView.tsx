import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  FileJson,
  Gavel,
  ShieldCheck,
  Swords,
  XCircle,
} from 'lucide-react'

import {
  getWalrusScanUrl,
  type EvidenceFetchResult,
} from '@/lib/evidence'
import { getExplorerTxUrl, getWalrusBlobUrl } from '@/lib/explorer'
import type { SupportedChain } from '@/constants/chains'
import { truncateAddress } from '@/lib/utils'

interface EvidenceRecordViewProps {
  blobId: string
  result: EvidenceFetchResult
}

export function EvidenceRecordView({ blobId, result }: EvidenceRecordViewProps) {
  if (result.status === 'not-found') {
    return (
      <StatusCard
        icon={<AlertCircle className="h-8 w-8 opacity-50" />}
        title="Blob not found on Walrus"
        body={`No blob with id ${blobId} was returned by the aggregator. Double-check the id — it may have been copied incorrectly.`}
      />
    )
  }
  if (result.status === 'unavailable') {
    return (
      <StatusCard
        icon={<AlertCircle className="h-8 w-8 opacity-50" />}
        title="Walrus is still retrieving this blob"
        body="Cold retrievals from the Walrus storage nodes can take a little while. Refresh in a few seconds to try again."
      />
    )
  }
  if (result.status === 'invalid') {
    return (
      <StatusCard
        icon={<AlertCircle className="h-8 w-8 opacity-50" />}
        title="Not a Red Sentinel evidence record"
        body="The blob exists on Walrus but its content is not a Red Sentinel attack record (valid JSON with the expected fields). You can still inspect the raw bytes below."
        rawBlobId={blobId}
      />
    )
  }

  const record = result.record
  const scorePct = Math.round(Math.min(Math.max(record.score, 0), 1) * 100)

  return (
    <div className="space-y-6">
      {/* Verdict header */}
      <section
        className={`rounded-lg border bg-[var(--color-bg-subtle)] p-5 md:p-6 ${
          record.success
            ? 'border-[var(--color-success,#4ade80)]/40'
            : 'border-[var(--color-border-subtle)]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {record.success ? (
            <CheckCircle className="h-6 w-6 shrink-0 text-[var(--color-success,#4ade80)]" />
          ) : (
            <XCircle className="h-6 w-6 shrink-0 text-[var(--color-text-muted)]" />
          )}
          <span
            className={`industrial-header text-base md:text-lg ${
              record.success
                ? 'text-[var(--color-success,#4ade80)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {record.success ? 'BREACH_CONFIRMED' : 'ATTACK_REPELLED'}
          </span>
          <span className="industrial-header ml-auto flex items-center gap-2 text-sm text-white">
            <Gavel className="h-4 w-4 text-[var(--color-gold-primary)]" />
            JURY_SCORE_{scorePct}%
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3 md:text-sm">
          <div>
            <dt className="industrial-label">SENTINEL</dt>
            <dd className="mt-1 font-semibold text-white">#{record.sentinelId}</dd>
          </div>
          <div>
            <dt className="industrial-label">CHAIN</dt>
            <dd className="mt-1 font-semibold uppercase text-white">{record.chain}</dd>
          </div>
          <div>
            <dt className="industrial-label">ATTACKER</dt>
            <dd className="mt-1 font-mono font-semibold text-white">
              {truncateAddress(record.userAddress)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Attack prompt + agent response */}
      <TranscriptBlock label="ATTACK_PROMPT" body={record.userPrompt} />
      <TranscriptBlock label="AGENT_RESPONSE" body={record.agentResponse} />

      {/* Provenance */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <Swords className="h-4 w-4 text-[var(--color-gold-primary)]" />
          PROVENANCE
        </h2>
        <dl className="mt-4 space-y-3 text-xs md:text-sm">
          <ProvenanceRow label="Walrus blob id">
            <span className="break-all font-mono text-white">{blobId}</span>
          </ProvenanceRow>
          <ProvenanceRow label="Attacker address">
            <span className="break-all font-mono text-white">{record.userAddress}</span>
          </ProvenanceRow>
          <ProvenanceRow label="Sentinel deployment tx">
            {record.deployTxHash ? (
              <a
                href={getExplorerTxUrl(record.deployTxHash, record.chain as SupportedChain)}
                target="_blank"
                rel="noopener noreferrer"
                className="industrial-header inline-flex items-center gap-1 text-[var(--color-gold-primary)] hover:text-white"
              >
                {record.deployTxHash.slice(0, 10)}…{record.deployTxHash.slice(-6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-[var(--color-text-muted)]">not recorded for this chain</span>
            )}
          </ProvenanceRow>
        </dl>
      </section>

      {/* Independent verification */}
      <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
        <h2 className="industrial-header flex items-center gap-2 text-sm text-white">
          <ShieldCheck className="h-4 w-4 text-[var(--color-gold-primary)]" />
          VERIFY_INDEPENDENTLY
        </h2>
        <p className="mt-2 text-xs text-[var(--color-text-muted)] md:text-sm">
          This page renders exactly the bytes stored on Walrus — nothing is edited in between.
          Verify without trusting us:
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={getWalrusBlobUrl(blobId)}
            target="_blank"
            rel="noopener noreferrer"
            className="industrial-header inline-flex items-center gap-2 border border-[var(--color-border-default)] px-4 py-2.5 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:bg-white hover:text-black"
          >
            RAW_BLOB_ON_WALRUS
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={getWalrusScanUrl(blobId)}
            target="_blank"
            rel="noopener noreferrer"
            className="industrial-header inline-flex items-center gap-2 border border-[var(--color-border-default)] px-4 py-2.5 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:bg-white hover:text-black"
          >
            WALRUSSCAN
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <details className="mt-5 border-t border-[var(--color-border-subtle)] pt-4">
          <summary className="industrial-header flex cursor-pointer items-center gap-2 text-[11px] text-[var(--color-text-muted)] hover:text-white">
            <FileJson className="h-3.5 w-3.5" />
            RAW_RECORD_JSON
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4 font-mono text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {JSON.stringify(record, null, 2)}
          </pre>
        </details>
      </section>
    </div>
  )
}

function StatusCard({
  icon,
  title,
  body,
  rawBlobId,
}: {
  icon: React.ReactNode
  title: string
  body: string
  rawBlobId?: string
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8 text-center">
      <div className="mx-auto mb-4 flex justify-center text-[var(--color-text-muted)]">{icon}</div>
      <h2 className="industrial-header text-sm text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-xs text-[var(--color-text-muted)] md:text-sm">
        {body}
      </p>
      {rawBlobId && (
        <a
          href={getWalrusBlobUrl(rawBlobId)}
          target="_blank"
          rel="noopener noreferrer"
          className="industrial-header mt-5 inline-flex items-center gap-2 border border-[var(--color-border-default)] px-4 py-2.5 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:bg-white hover:text-black"
        >
          RAW_BLOB_ON_WALRUS
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

function TranscriptBlock({ label, body }: { label: string; body: string }) {
  return (
    <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 md:p-6">
      <h2 className="industrial-header text-sm text-white">{label}</h2>
      <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4 font-body text-xs leading-relaxed text-[var(--color-text-secondary)] md:text-sm">
        {body}
      </pre>
    </section>
  )
}

function ProvenanceRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <dt className="industrial-label w-48 shrink-0">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
