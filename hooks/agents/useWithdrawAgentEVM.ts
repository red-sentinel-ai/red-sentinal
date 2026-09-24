'use client'

import { useState, useCallback } from 'react'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'
import { AGENT_QUERY_KEY } from './useAgentDetails'

interface UseWithdrawAgentEVMOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface WithdrawAgentEVMParams {
  agentId: string
  amount: number
  decimals: number
  symbol: string
}

export const useWithdrawAgentEVM = (options: UseWithdrawAgentEVMOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { walletAddress, requireEvmConfig, writeContract, isWalletConnected } =
    useEvmContractWriter()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdrawAgent = useCallback(
    async ({ agentId, amount, decimals, symbol }: WithdrawAgentEVMParams) => {
      setIsLoading(true)
      setError(null)

      try {
        const txHash = await writeContract({
          address: requireEvmConfig().contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'withdrawFromAgent',
          args: [agentId, parseUnits(String(amount), decimals)],
        })

        if (showToasts) toast.success(`Successfully withdrew ${amount} ${symbol}`)
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to withdraw')
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

  return { withdrawAgent, isLoading, error, isConnected: isWalletConnected }
}

export type { WithdrawAgentEVMParams, UseWithdrawAgentEVMOptions }
