'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchRagDocument, RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentDetailResponse } from '@/lib/rag/rag-types'

/**
 * Load one RAG Content Document with its reconstructed content and ordered
 * chunks. Only fetched while a document is selected (chunk inspector open).
 */
export function useRagDocument(
  network: string | null,
  sentinelId: number | null,
  documentId: string | null
) {
  return useQuery<RagDocumentDetailResponse, RagApiError>({
    queryKey: ['rag-document', network, sentinelId, documentId],
    queryFn: () => fetchRagDocument(network as string, sentinelId as number, documentId as string),
    enabled: Boolean(network && sentinelId && documentId),
    staleTime: 15_000,
    retry: false,
  })
}
