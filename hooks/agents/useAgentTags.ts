'use client'

import { useQuery } from '@tanstack/react-query'

import type { SentinelTag } from '@/types/tags'

export type TagsByAgentId = Record<string, SentinelTag[]>

async function fetchAgentTags(agentIds: string[]): Promise<TagsByAgentId> {
  const response = await fetch(`/api/agents/tags?ids=${agentIds.join(',')}`)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load sentinel tags')
  }
  return data.tagsByAgentId ?? {}
}

/** Tags assigned to the given sentinel ids (numeric agent ids as strings). */
export function useAgentTags(agentIds: string[]) {
  const sortedIds = [...agentIds].sort()

  return useQuery<TagsByAgentId, Error>({
    queryKey: ['agent-tags', sortedIds.join(',')],
    queryFn: () => fetchAgentTags(sortedIds),
    enabled: sortedIds.length > 0,
    staleTime: 60_000,
    placeholderData: previous => previous,
  })
}
