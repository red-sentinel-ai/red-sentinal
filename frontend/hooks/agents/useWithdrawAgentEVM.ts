'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useAccount, useChainId } from 'wagmi'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { getEvmConfig } from '@/constants/evm'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { useEVMWallet } from '@/hooks/useEVMWallet'
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
  const { address: walletAddress } = useEVMWallet()
  const { chain: currentChain } = useAccount()
  const evmCfg = getEvmConfig(useChainId())
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdrawAgent = useCallback(
    async ({ agentId, amount, decimals, symbol }: WithdrawAgentEVMParams) => {
      if (!walletAddress) {
        const msg = 'EVM wallet not connected'
        setError(msg)
        if (showToasts) toast.error(msg)
        throw new Error(msg)
      }

      setIsLoading(true)
      setError(null)

      const amountRaw = BigInt(Math.round(amount * Math.pow(10, decimals)))

      try {
        const txHash = await writeContractAsync({
          account: walletAddress,
          chain: currentChain ?? null,
          address: evmCfg.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'withdrawFromAgent',
          args: [agentId, amountRaw],
        })

        if (showToasts) toast.success(`Successfully withdrew ${amount} ${symbol}`)
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to withdraw'
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, currentChain, writeContractAsync, queryClient, onSuccess, onError, showToasts]
  )

  return { withdrawAgent, isLoading, error, isConnected: !!walletAddress }
}

export type { WithdrawAgentEVMParams, UseWithdrawAgentEVMOptions }
