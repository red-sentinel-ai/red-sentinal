import { useMutation } from '@tanstack/react-query'

type RequestPayload = {
  name: string
  email_id: string
  wallet_address: string
  description: string
  agent_id: number
  telegram_username?: string
  twitter_username?: string
}

export function useRequestFeatureAgent() {
  return useMutation({
    mutationFn: async (payload: RequestPayload) => {
      const res = await fetch('/api/agents/request-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request feature')
      }

      return data
    },
  })
}
