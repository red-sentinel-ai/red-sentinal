import { getWalrusBlobUrl } from '@/lib/explorer'

/**
 * Evidence records are the JSON documents stored on Walrus for every
 * completed attack. Canonical schema lives in the backend
 * (backend-service/api/services/walrus-storage.ts, `AttackRecord`) — keep the
 * two in sync.
 */
export interface EvidenceRecord {
  userPrompt: string
  userAddress: string
  sentinelId: number
  agentResponse: string
  success: boolean
  score: number
  chain: string
  deployTxHash: string | null
}

/** One row of the public recent-evidence feed (GET /walrus/:network/records/recent). */
export interface EvidenceListItem {
  attack_id: string
  sentinel_id: number
  blob_id: string
  register_digest: string | null
  certify_digest: string | null
  success: boolean | null
  attacker_address: string | null
  created_at: string
}

export interface RecentEvidenceResponse {
  network: string
  total: number
  records: EvidenceListItem[]
}

/** Walrus blob ids are URL-safe base64 of a 32-byte hash (43 chars). */
const BLOB_ID_PATTERN = /^[A-Za-z0-9_-]{32,128}$/

export function isValidBlobId(blobId: string): boolean {
  return BLOB_ID_PATTERN.test(blobId)
}

/**
 * Accept a blob id pasted with stray whitespace or as a full evidence-explorer
 * or aggregator URL — take the last path segment.
 */
export function normalizeBlobId(input: string): string {
  const trimmed = input.trim()
  const lastSegment = trimmed.split('/').filter(Boolean).pop() ?? trimmed
  return lastSegment
}

function isEvidenceRecord(value: unknown): value is EvidenceRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.userPrompt === 'string' &&
    typeof record.userAddress === 'string' &&
    typeof record.sentinelId === 'number' &&
    typeof record.agentResponse === 'string' &&
    typeof record.success === 'boolean' &&
    typeof record.score === 'number' &&
    typeof record.chain === 'string' &&
    (record.deployTxHash === null || typeof record.deployTxHash === 'string')
  )
}

export type EvidenceFetchResult =
  | { status: 'ok'; record: EvidenceRecord }
  | { status: 'not-found' }
  | { status: 'invalid' }
  | { status: 'unavailable' }

/**
 * Read an evidence blob from the public Walrus aggregator. Aggregators may
 * need tens of seconds on a cold retrieval, so callers should present a
 * friendly retry state when this resolves to 'unavailable'.
 */
export async function fetchEvidenceBlob(blobId: string): Promise<EvidenceFetchResult> {
  let response: Response
  try {
    response = await fetch(getWalrusBlobUrl(blobId), {
      cache: 'no-store',
      signal: AbortSignal.timeout(25_000),
      headers: { accept: 'application/json, application/octet-stream, */*' },
    })
  } catch {
    return { status: 'unavailable' }
  }

  if (response.status === 404) return { status: 'not-found' }
  if (!response.ok) return { status: 'unavailable' }

  try {
    const parsed: unknown = JSON.parse(await response.text())
    if (!isEvidenceRecord(parsed)) return { status: 'invalid' }
    return { status: 'ok', record: parsed }
  } catch {
    return { status: 'invalid' }
  }
}

/** Third-party verification surfaces for a blob, used by the evidence pages. */
export function getWalrusScanUrl(blobId: string): string {
  return `https://walruscan.com/mainnet/blob/${blobId}`
}
