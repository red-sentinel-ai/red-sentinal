'use client'

import { useQuery } from '@tanstack/react-query'

import type { SentinelTag } from '@/types/tags'

async function fetchTags(): Promise<SentinelTag[]> {
  const response = await fetch('/api/tags')
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load tags')
  }
  return data.tags ?? []
}

/** Active tags for the launch-sentinel Tags dropdown. */
export function useTags() {
  return useQuery<SentinelTag[], Error>({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 60_000,
  })
}
