'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteRagDocument, RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentMutationResponse } from '@/lib/rag/rag-types'
import { ragDocumentsQueryKey } from './useRagDocuments'

/**
 * Delete one RAG Content Document. Only that document's chunks are removed;
 * the response carries the remaining inventory, which seeds the cache so the
 * list view updates without a refetch.
 */
export function useDeleteRagDocument(
  network: string | null,
  sentinelId: number | null,
  documentId: string | null
) {
  const queryClient = useQueryClient()

  return useMutation<RagDocumentMutationResponse, RagApiError, void>({
    mutationFn: () =>
      deleteRagDocument(network as string, sentinelId as number, documentId as string),
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
      }
    },
  })
}
