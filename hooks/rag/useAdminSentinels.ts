'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchAdminSentinels, RagApiError } from '@/lib/rag/rag-api'
import type { AdminSentinelListItem } from '@/lib/rag/rag-types'

/**
 * List active live Sentinels on a network for the RAG management picker.
 * Backend pagination is capped at limit=100 which comfortably covers the
 * current live-Sentinel population per network.
 */
export function useAdminSentinels(network: string | null) {
  return useQuery<AdminSentinelListItem[], RagApiError>({
    queryKey: ['admin-sentinels', network],
    queryFn: async () => {
      const data = await fetchAdminSentinels(network as string)
      return data.sentinels ?? []
    },
    enabled: Boolean(network),
    staleTime: 60_000,
    retry: false,
  })
}
