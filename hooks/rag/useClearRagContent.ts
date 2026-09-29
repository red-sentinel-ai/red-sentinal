'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearRagContent, RagApiError } from '@/lib/rag/rag-api'
import { ragDocumentsQueryKey } from './useRagDocuments'

/**
 * Clear all RAG content for a live Sentinel. The backend removes every chunk
 * from the Sentinel's namespace and disables RAG; the inventory query is
 * invalidated so the management view reflects the disabled empty state.
 */
export function useClearRagContent(network: string | null, sentinelId: number | null) {
  const queryClient = useQueryClient()

  return useMutation<{ sentinel_id: number; status: 'rag_cleared' }, RagApiError, void>({
    mutationFn: () => clearRagContent(network as string, sentinelId as number),
    onSuccess: () => {
      if (network && sentinelId) {
        void queryClient.invalidateQueries({
          queryKey: ragDocumentsQueryKey(network, sentinelId),
        })
      }
    },
  })
}
