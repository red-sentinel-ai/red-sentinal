import { SUI_SENTINEL_API_URL } from '@/constants'

/** A single memory recalled from a sentinel's Walrus namespace. */
export interface SentinelMemory {
  text: string
  /** Cosine distance from the query — lower is more similar. */
  distance: number
}

export interface SentinelMemoryResult {
  sentinel_id: number
  network: string
  /** Whether Walrus Memory is configured and switched on for the backend. */
  enabled: boolean
  memories: SentinelMemory[]
}

/**
 * Fetch a sentinel's Walrus memories. The backend endpoint is owner-gated, so a
 * viewer who is not the sentinel's creator gets 401/403 — we translate that to
 * `null` so the caller can simply hide the panel rather than surface an error.
 */
export async function fetchSentinelMemories(params: {
  network: string
  sentinelId: number
  userId: string
}): Promise<SentinelMemoryResult | null> {
  const response = await fetch(
    `${SUI_SENTINEL_API_URL}/sentinels/${params.network}/${params.sentinelId}/memory`,
    {
      headers: { 'x-user-id': params.userId },
      cache: 'no-store',
    }
  )

  // Not the owner (or not authenticated) — no memory to show, not an error.
  if (response.status === 401 || response.status === 403) return null

  if (!response.ok) {
    throw new Error(`Failed to load sentinel memories (${response.status})`)
  }

  return response.json()
}
