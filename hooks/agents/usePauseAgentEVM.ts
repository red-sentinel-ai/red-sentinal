'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { AGENT_QUERY_KEY } from './useAgentDetails'

interface UsePauseAgentEVMOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

// Withdrawals are only accepted while a sentinel is paused, and the contract
// starts a 3-hour cooldown at pause time — surfaced here so the UI can tell
// the owner why their funds are not yet claimable.
export const WITHDRAWAL_COOLDOWN_MS = 3 * 60 * 60 * 1000

export const usePauseAgentEVM = (options: UsePauseAgentEVMOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { walletAddress, requireEvmConfig, writeContractAndWait, isWalletConnected } =
    useEvmContractWriter()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pauseAgent = useCallback(
    async (agentId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const txHash = await writeContractAndWait({
          address: requireEvmConfig().contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'pauseAgent',
          args: [agentId],
        })

        if (showToasts)
          toast.success('Sentinel paused — funds can be withdrawn after the 3-hour cooldown')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to pause sentinel')
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, requireEvmConfig, writeContractAndWait, queryClient, onSuccess, onError, showToasts]
  )

  const unpauseAgent = useCallback(
    async (agentId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const txHash = await writeContractAndWait({
          address: requireEvmConfig().contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'unpauseAgent',
          args: [agentId],
        })

        if (showToasts) toast.success('Sentinel resumed — attacks are accepted again')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to resume sentinel')
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, requireEvmConfig, writeContractAndWait, queryClient, onSuccess, onError, showToasts]
  )

  return {
    pauseAgent,
    unpauseAgent,
    isLoading,
    error,
    isConnected: isWalletConnected,
  }
}

export type { UsePauseAgentEVMOptions }
