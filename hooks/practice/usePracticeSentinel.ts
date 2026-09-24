import { useQuery } from '@tanstack/react-query'

import type { PracticeSentinelPublic } from '@/types/practice'

export const PRACTICE_SENTINEL_QUERY_KEY = 'practiceSentinel'

export function usePracticeSentinel(id?: number | string) {
  return useQuery<PracticeSentinelPublic>({
    queryKey: [PRACTICE_SENTINEL_QUERY_KEY, id],
    enabled: id !== undefined && id !== '',
    queryFn: async () => {
      const res = await fetch(`/api/practice-sentinels/${id}`)
      if (!res.ok) {
        throw new Error('Sentinel not found or inactive')
      }
      return res.json()
    },
  })
}
