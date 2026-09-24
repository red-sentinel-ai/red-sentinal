import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL, APP_NETWORK } from '@/constants'
import type { Agent } from '@/types/agents'

export const AGENT_QUERY_KEY = 'agent'

export function useAgent(slug?: string) {
  return useQuery<Agent>({
    queryKey: [AGENT_QUERY_KEY, slug, APP_NETWORK],
    queryFn: async () => {
      let normalizedSlug: string
      try {
        normalizedSlug = decodeURIComponent(slug!)
      } catch {
        normalizedSlug = slug!
      }
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/agents/${APP_NETWORK}/details?agent_path=${encodeURIComponent(normalizedSlug)}`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to fetch agent details')
      }
      const data = await res.json()
      if (data.accumulated_fees != null) {
        data.accumulated_fees = Number(data.accumulated_fees)
      }
      return data
    },
    staleTime: 30_000,
    enabled: !!slug,
  })
}
