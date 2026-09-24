'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { AGENT_QUERY_KEY } from './useAgentDetails'

interface UseClaimFeesEVMOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

export const useClaimFeesEVM = (options: UseClaimFeesEVMOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { walletAddress, requireEvmConfig, writeContract, isWalletConnected } =
    useEvmContractWriter()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claimFees = useCallback(
    async (agentId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const txHash = await writeContract({
          address: requireEvmConfig().contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'claimFees',
          args: [agentId],
        })

        if (showToasts) toast.success('Fees claimed successfully!')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to claim fees')
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, requireEvmConfig, writeContract, queryClient, onSuccess, onError, showToasts]
  )

  return { claimFees, isLoading, error, isConnected: isWalletConnected }
}

export type { UseClaimFeesEVMOptions }
