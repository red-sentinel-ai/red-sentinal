'use client'

import { useQuery } from '@tanstack/react-query'

import { PROVIDER_MODELS } from '@/constants'

/**
 * The admin-managed provider→models catalogue, served by the backend and
 * edited from the landing-page admin portal. Falls back to the static seed
 * in `constants` while loading or on error, so the deploy modal's
 * provider/model dropdowns are never empty.
 */
export function useProviderModels() {
  const query = useQuery<Record<string, string[]>>({
    queryKey: ['provider-models'],
    queryFn: async () => {
      const res = await fetch('/api/provider-models')
      if (!res.ok) throw new Error('Failed to fetch provider models')
      const data = await res.json()
      return data.providers ?? PROVIDER_MODELS
    },
    placeholderData: PROVIDER_MODELS,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  return { ...query, providerModels: query.data ?? PROVIDER_MODELS }
}
