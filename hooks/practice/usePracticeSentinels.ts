import { useQuery } from '@tanstack/react-query'

import type { PracticeSentinelsResponse } from '@/types/practice'

export const PRACTICE_SENTINELS_QUERY_KEY = 'practiceSentinels'

export function usePracticeSentinels() {
  return useQuery<PracticeSentinelsResponse>({
    queryKey: [PRACTICE_SENTINELS_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch('/api/practice-sentinels?limit=100')
      if (!res.ok) {
        throw new Error('Failed to load practice sentinels')
      }
      return res.json()
    },
  })
}
