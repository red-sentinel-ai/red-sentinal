import { useMutation } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { removeSocial } from '@/lib/auth-api'

type RemoveSocialArgs = {
  connectionId: string
  platform: string
}

export const useRemoveSocialConnection = () => {
  return useMutation({
    mutationFn: ({ connectionId }: RemoveSocialArgs) => removeSocial(connectionId),
    onSuccess: (_, { platform }) => {
      toast.success(`${platform} disconnected`)
    },
    onError: (error: any, { platform }) => {
      toast.error(`Error disconnecting ${platform}: ${error.message}`)
    },
  })
}
