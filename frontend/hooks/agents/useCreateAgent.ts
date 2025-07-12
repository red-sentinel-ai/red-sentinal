import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

interface CreateAgentPayload {
  agent_id: number
  agent_name: string
  agent_profile?: string
  message_price?: number
  object_id: string
  owner: string
  digest: string
}

interface CreateAgentResponse {
  message: string
  data: {
    id: string
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
    mutationFn: async (payload: CreateAgentPayload): Promise<CreateAgentResponse> => {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
