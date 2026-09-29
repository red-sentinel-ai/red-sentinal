'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { replaceRagDocument, RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentMutationResponse, RagDocumentPayload } from '@/lib/rag/rag-types'
import { ragDocumentsQueryKey } from './useRagDocuments'

/**
 * Replace one RAG Content Document's content. The backend indexes the new
 * revision before removing the prior one, so a failure leaves the previous
 * revision retrievable; the inventory is refreshed either way on success.
 */
export function useReplaceRagDocument(
  network: string | null,
  sentinelId: number | null,
  documentId: string | null
) {
  const queryClient = useQueryClient()

  return useMutation<RagDocumentMutationResponse, RagApiError, RagDocumentPayload>({
    mutationFn: payload =>
      replaceRagDocument(network as string, sentinelId as number, documentId as string, payload),
    onSuccess: response => {
      if (network && sentinelId) {
        queryClient.setQueryData(ragDocumentsQueryKey(network, sentinelId), {
          sentinel_id: response.sentinel_id,
          network: response.network,
          index_name: response.index_name,
          namespace: response.namespace,
          enabled: response.enabled,
          document_count: response.document_count,
          documents: response.documents,
        })
        void queryClient.invalidateQueries({
          queryKey: ragDocumentsQueryKey(network, sentinelId),
        })
        void queryClient.invalidateQueries({ queryKey: ['rag-document'] })
      }
    },
  })
}
