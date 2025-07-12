import { useQuery } from '@tanstack/react-query'

type FeaturedAgent = {
  is_featured: true
  agent_id: number
}

export function useFeaturedAgents() {
  return useQuery<FeaturedAgent[]>({
    queryKey: ['featured-agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents/featured')
      if (!res.ok) throw new Error('Failed to fetch featured agents')
      return res.json()
    },
  })
}
