'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createRagDocument, RagApiError } from '@/lib/rag/rag-api'
import type { RagDocumentMutationResponse, RagDocumentPayload } from '@/lib/rag/rag-types'
import { ragDocumentsQueryKey } from './useRagDocuments'

/**
 * Add a new RAG Content Document to a live Sentinel's namespace. On success
 * the refreshed inventory returned by the API seeds the cache directly and
 * the inventory query is invalidated so the list view reflects the mutation.
 */
export function useCreateRagDocument(network: string | null, sentinelId: number | null) {
  const queryClient = useQueryClient()

  return useMutation<RagDocumentMutationResponse, RagApiError, RagDocumentPayload>({
    mutationFn: payload => createRagDocument(network as string, sentinelId as number, payload),
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
