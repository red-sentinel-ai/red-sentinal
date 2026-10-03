import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL } from '@/constants'
import type {
  TagAttackersResponse,
  TagDefendersResponse,
  TagPageResponse,
  TagSentinelsResponse,
} from '@/types/tag-pages'

/**
 * Public Tag Page data hooks (WO-20). All reads hit the public tag-page read
 * APIs; a 404 (unknown slug, unpublished page, or unassigned custom URL)
 * resolves to `null` so the renderer can show the no-content state without
 * distinguishing it from a missing page.
 */

async function fetchTagPage(slug: string): Promise<TagPageResponse | null> {
  const response = await fetch(
    `${SUI_SENTINEL_API_URL}/tag-pages/${encodeURIComponent(slug)}`,
    { credentials: 'include', cache: 'no-store' }
  )
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Failed to load tag page')
  return response.json()
}

export function useTagPage(slug: string) {
  return useQuery({
    queryKey: ['tag-page', slug],
    queryFn: () => fetchTagPage(slug),
    staleTime: 60 * 1000,
    retry: false,
  })
}

export type TagLeaderboardKind = 'defenders' | 'attackers'

const LEADERBOARD_PAGE_SIZE = 10

function leaderboardUrl(slug: string, kind: TagLeaderboardKind, sort: string, offset: number): string {
  const url = new URL(
    `${SUI_SENTINEL_API_URL}/tag-pages/${encodeURIComponent(slug)}/leaderboards/${kind}`
  )
  url.searchParams.set('sort', sort)
  url.searchParams.set('limit', String(LEADERBOARD_PAGE_SIZE))
  url.searchParams.set('offset', String(offset))
  return url.toString()
}

export function useTagDefenders(slug: string, sort: string) {
  return useInfiniteQuery({
    queryKey: ['tag-leaderboard', slug, 'defenders', sort],
    queryFn: async ({ pageParam = 0 }): Promise<TagDefendersResponse> => {
      const response = await fetch(
        leaderboardUrl(slug, 'defenders', sort, pageParam),
        { credentials: 'include' }
      )
      if (!response.ok) throw new Error('Failed to load tag defenders leaderboard')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.defenders.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}

export function useTagAttackers(slug: string, sort: string) {
  return useInfiniteQuery({
    queryKey: ['tag-leaderboard', slug, 'attackers', sort],
    queryFn: async ({ pageParam = 0 }): Promise<TagAttackersResponse> => {
      const response = await fetch(
        leaderboardUrl(slug, 'attackers', sort, pageParam),
        { credentials: 'include' }
      )
      if (!response.ok) throw new Error('Failed to load tag attackers leaderboard')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.attackers.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}

const SENTINEL_PAGE_SIZE = 10

export function useTagSentinels(slug: string, status: string) {
  return useInfiniteQuery({
    queryKey: ['tag-sentinels', slug, status],
    queryFn: async ({ pageParam = 0 }): Promise<TagSentinelsResponse> => {
      const url = new URL(`${SUI_SENTINEL_API_URL}/tag-pages/${encodeURIComponent(slug)}/sentinels`)
      url.searchParams.set('limit', String(SENTINEL_PAGE_SIZE))
      url.searchParams.set('offset', String(pageParam))
      if (status) url.searchParams.set('status', status)

      const response = await fetch(url.toString(), { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load tag sentinels')
      return response.json()
    },
    getNextPageParam: lastPage => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (lastPage.sentinels.length < lastPage.limit || nextOffset >= lastPage.total) {
        return undefined
      }
      return nextOffset
    },
    initialPageParam: 0,
    staleTime: 60 * 1000,
  })
}
