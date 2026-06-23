'use client'

import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import type { BackendSyndicate } from '@/types/Syndicate'

export function useSyndicateData(identifier?: string) {
  return useQuery<{ syndicate: BackendSyndicate }>({
    queryKey: ['syndicate-meta', identifier],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicates/${identifier}?network=${APP_NETWORK}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Syndicate not found')
      return res.json()
    },
    enabled: !!identifier,
  })
}
