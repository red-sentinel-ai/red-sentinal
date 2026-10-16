import { useQuery } from '@tanstack/react-query'

import { APP_NETWORK, SUI_SENTINEL_API_URL } from '@/constants'
import type { RecentEvidenceResponse } from '@/lib/evidence'

async function fetchRecentEvidence(limit = 25): Promise<RecentEvidenceResponse> {
  const res = await fetch(
    `${SUI_SENTINEL_API_URL}/walrus/${APP_NETWORK}/records/recent?limit=${limit}`
  )
  if (!res.ok) throw new Error(`Failed to fetch recent evidence: ${res.status}`)
  return (await res.json()) as RecentEvidenceResponse
}

/** Public feed of the newest certified evidence blobs plus the on-chain total. */
export function useRecentEvidence(limit = 25) {
  return useQuery<RecentEvidenceResponse>({
    queryKey: ['walrus-recent-evidence', APP_NETWORK, limit],
    queryFn: () => fetchRecentEvidence(limit),
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}
