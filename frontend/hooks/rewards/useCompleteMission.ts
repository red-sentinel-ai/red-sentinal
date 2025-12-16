import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionMetadata, RHUser } from '@/types/Rewards'
import { toast } from 'react-toastify'
import { AGENT_EVENTS_QUERY_KEY } from '../useAgentEvents'

export interface CompleteMissionParams {
  wallet_address: string
  mission_type: string
  transaction_hash?: string
  metadata?: MissionMetadata
  points_to_award?: number
}

export interface CompleteMissionResponse {
  success: boolean
  points_earned: number
  new_total: number
  new_tier: string
  user: RHUser
}

export function useCompleteMission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CompleteMissionParams): Promise<CompleteMissionResponse> => {
      console.log('post request called ')
      const response = await fetch('/api/rewards/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete mission')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-rewards', variables.wallet_address] })

      queryClient.invalidateQueries({ queryKey: [AGENT_EVENTS_QUERY_KEY] })
      toast.success(`Mission completed! +${data.points_earned} SENTINEL`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
