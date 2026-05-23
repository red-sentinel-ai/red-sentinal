'use client'

import { useQuery } from '@tanstack/react-query'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'

export interface SyndicateListItem {
  contract_address: string
  owner: string
  name: string
  description: string
  social_link: string | null
  token_address: string
  token_symbol: string
  whitelist_enabled: boolean
  agent_id: string | null
  network: string
  created_at: string
}

interface SyndicatesResponse {
  syndicates: SyndicateListItem[]
  total: number
}

export function useSyndicatesList(owner?: string) {
  return useQuery<SyndicatesResponse>({
    queryKey: ['syndicates-list', APP_NETWORK, owner],
    queryFn: async () => {
      const params = new URLSearchParams({ network: APP_NETWORK, limit: '50' })
      if (owner) params.set('owner', owner)
      const res = await fetch(`${SUI_SENTINEL_API_URL}/syndicates?${params}`)
      if (!res.ok) throw new Error('Failed to fetch syndicates')
      return res.json()
    },
    staleTime: 30_000,
  })
}
