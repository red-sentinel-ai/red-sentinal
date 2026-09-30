'use client'

import { useQuery } from '@tanstack/react-query'

import type { SentinelTag } from '@/types/tags'

export type TagsByAgentId = Record<string, SentinelTag[]>

/** The /api/agents/tags route caps ids per request — stay under it. */
const IDS_PER_REQUEST = 100

async function fetchAgentTags(agentIds: string[]): Promise<TagsByAgentId> {
  const chunks: string[][] = []
  for (let i = 0; i < agentIds.length; i += IDS_PER_REQUEST) {
    chunks.push(agentIds.slice(i, i + IDS_PER_REQUEST))
  }

  const pages = await Promise.all(
    chunks.map(async chunk => {
      const response = await fetch(`/api/agents/tags?ids=${chunk.join(',')}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sentinel tags')
      }
      return (data.tagsByAgentId ?? {}) as TagsByAgentId
    })
  )
  return Object.assign({}, ...pages)
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
