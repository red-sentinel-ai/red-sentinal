'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchRagDocuments, RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentsListResponse } from '@/lib/rag/rag-types'

/** Query key for a sentinel's RAG document inventory. */
export function ragDocumentsQueryKey(network: string, sentinelId: number) {
  return ['rag-documents', network, sentinelId] as const
}

/**
 * Load the RAG Content Document inventory for one live Sentinel.
 * Disabled sentinels still resolve (with `enabled: false` and an empty
 * inventory) so the management view can render its empty state.
 */
export function useRagDocuments(network: string | null, sentinelId: number | null) {
  return useQuery<RagDocumentsListResponse, RagApiError>({
    queryKey: ragDocumentsQueryKey(network ?? '', sentinelId ?? 0),
    queryFn: () => fetchRagDocuments(network as string, sentinelId as number),
    enabled: Boolean(network && sentinelId),
    staleTime: 15_000,
    retry: false,
  })
}
