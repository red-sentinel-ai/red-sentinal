'use client'

import { Eye } from 'lucide-react'

import type { EvidenceSource } from '@/app/defend/agentic-types'
import { describeEvidenceSource } from '@/app/defend/deployment-utils'

const EVIDENCE_SOURCE_LABELS: Record<EvidenceSource, string> = {
  red_sentinel: 'Observed by Red Sentinel',
  connected_agent: 'Supplied by your connected agent',
  none: 'No action evidence',
}

interface EvidenceSourceNoticeProps {
  source: EvidenceSource
}

export function EvidenceSourceNotice({ source }: EvidenceSourceNoticeProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3">
      <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-gold-primary)]" />
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-[var(--color-text-primary)]">
          Evidence source: {EVIDENCE_SOURCE_LABELS[source]}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{describeEvidenceSource(source)}</p>
      </div>
    </div>
  )
}

export { EVIDENCE_SOURCE_LABELS }
