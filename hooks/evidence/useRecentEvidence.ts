import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import type { RecentEvidenceResponse } from '@/lib/evidence'

async function fetchRecentEvidence(limit: number, offset: number): Promise<RecentEvidenceResponse> {
  const res = await fetch(
    `${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records/recent?limit=${limit}&offset=${offset}`
  )
  if (!res.ok) throw new Error(`Failed to fetch recent evidence: ${res.status}`)
  return (await res.json()) as RecentEvidenceResponse
}

/**
 * Public feed of certified evidence blobs plus the on-chain total. Paginated
 * with limit/offset so the evidence explorer can page through every record.
 */
export function useRecentEvidence(limit = 25, offset = 0) {
  return useQuery<RecentEvidenceResponse>({
    queryKey: ['walrus-recent-evidence', APP_NETWORK, limit, offset],
    queryFn: () => fetchRecentEvidence(limit, offset),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
