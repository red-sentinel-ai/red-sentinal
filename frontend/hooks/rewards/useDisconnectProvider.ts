import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

type DisconnectArgs = {
  provider: string
  walletAddress: string
}

export const useDisconnectProvider = () => {
  return useMutation({
    mutationFn: async ({ provider, walletAddress }: DisconnectArgs) => {
      const res = await fetch('/api/auth/disconnect-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, walletAddress }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error?.error || 'Disconnect failed')
      }

      return true
    },
    onSuccess: (_, { provider }) => {
      toast.success(`${provider} disconnected`)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, { provider }) => {
      toast.error(`Error disconnecting ${provider}: ${error.message}`)
    },
  })
}
