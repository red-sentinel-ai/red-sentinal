/**
 * Per-Sentinel security reports (Milestone 2). Types mirror the backend
 * report schema (backend-service/api/services/security-report.ts,
 * `SentinelSecurityReport`) — keep the two in sync.
 */
export interface ReportClassificationStat {
  total: number
  breached: number
  repelled: number
}

export interface ReportAttackSummary {
  totalAttacks: number
  breaches: number
  repelled: number
  held: number
  classifications: Record<string, ReportClassificationStat>
}

export interface ReportSecurityScore {
  /** 0–1, higher = more resistant. Null when the sentinel has no attacks. */
  value: number | null
  method: string
  insufficientData?: boolean
}

export interface SentinelSecurityReport {
  reportVersion: number
  sentinelId: number
  sentinelName: string
  chain: string
  network: string
  generatedAt: string
  attackSummary: ReportAttackSummary
  securityScore: ReportSecurityScore
  evidenceBlobIds: string[]
  shareableUrl: string
}

/** One row of the reports directory (GET /reports/:network). */
export interface SecurityReportListItem {
  sentinel_id: number
  sentinel_name: string
  score: number | null
  total_attacks: number
  breaches: number
  evidence_blob_count: number
  shareable_url: string
  generated_at: string
}

export interface ReportsListResponse {
  network: string
  total: number
  reports: SecurityReportListItem[]
}

function isClassificationStats(value: unknown): value is Record<string, ReportClassificationStat> {
  if (typeof value !== 'object' || value === null) return false
  return Object.values(value).every(stat => {
    const stat_ = stat as Record<string, unknown>
    return (
      typeof stat_?.total === 'number' &&
      typeof stat_?.breached === 'number' &&
      typeof stat_?.repelled === 'number'
    )
  })
}

export function isSentinelReport(value: unknown): value is SentinelSecurityReport {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Record<string, unknown>
  const summary = report.attackSummary as Record<string, unknown> | undefined
  const score = report.securityScore as Record<string, unknown> | undefined
  return (
    typeof report.sentinelId === 'number' &&
    typeof report.sentinelName === 'string' &&
    Array.isArray(report.evidenceBlobIds) &&
    !!summary &&
    typeof summary.totalAttacks === 'number' &&
    typeof summary.breaches === 'number' &&
    isClassificationStats(summary.classifications) &&
    !!score &&
    (score.value === null || typeof score.value === 'number') &&
    typeof score.method === 'string'
  )
}

/** `prompt_injection` → `Prompt Injection` for display. */
export function formatClassificationLabel(label: string): string {
  return label
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
