import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

interface CreateAgentResponse {
  message: string
  data: {
    agent_id: number
    agent_name: string
    agent_profile?: string
    message_price?: number
    object_id: string
    owner: string
    digest: string
    created_at: string
  }
}

export const useCreateAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData): Promise<CreateAgentResponse> => {
      const response = await fetch('/api/agents', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create agent')
      }

      return response.json()
    },

    onSuccess: (data) => {
      toast.success(`Agent "${data.data.agent_name}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },

    onError: (error: Error) => {
      toast.error(`Agent creation failed: ${error.message}`)
    },
  })
}
