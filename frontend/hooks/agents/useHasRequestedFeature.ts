import { useQuery } from '@tanstack/react-query'

export const HAS_REQUESTED_QUERY_KEY = 'hasRequestedFeature'

export function useHasRequestedFeature(agentId: number | null, walletAddress: string | null) {
  return useQuery({
    enabled: !!agentId && !!walletAddress,
    queryKey: [HAS_REQUESTED_QUERY_KEY, agentId, walletAddress],
    queryFn: async () => {
      const res = await fetch(
        `/api/agents/request-featured/check?agent_id=${agentId}&wallet_address=${walletAddress}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to check request status')
      return data.alreadyRequested
    },
  })
}
