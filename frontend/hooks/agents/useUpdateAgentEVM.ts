'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { AGENT_QUERY_KEY } from './useAgentDetails'

export const useUpdateAgentEVM = () => {
  const { walletAddress, requireEvmConfig, writeContract } = useEvmContractWriter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const updateCost = useCallback(
    async (agentId: string, newCostRaw: bigint, onSuccess?: () => void) => {
      setIsLoading(true)
      try {
        await writeContract({
          address: requireEvmConfig().contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'updateAgentCost',
          args: [agentId, newCostRaw],
        })

        toast.success('Agent attack fee updated successfully!')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })
        onSuccess?.()
      } catch (err) {
        toast.error(toReadableEvmError(err, 'Failed to update agent'))
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, requireEvmConfig, writeContract, queryClient]
  )

  return { updateCost, isLoading }
}
