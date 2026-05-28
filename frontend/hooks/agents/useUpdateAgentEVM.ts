'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useAccount, useChainId } from 'wagmi'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { getEvmConfig } from '@/constants/evm'
import { SENTINEL_ABI } from '@/lib/evm/abi'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { AGENT_DETAILS_FULL_QUERY_KEY } from './useAgentDetails'

export const useUpdateAgentEVM = () => {
  const { address: walletAddress } = useEVMWallet()
  const { chain: currentChain } = useAccount()
  const evmCfg = getEvmConfig(useChainId())
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const updateCost = useCallback(
    async (agentId: string, newCostRaw: bigint, onSuccess?: () => void) => {
      if (!walletAddress) {
        toast.error('EVM wallet not connected')
        return
      }

      setIsLoading(true)
      try {
        await writeContractAsync({
          account: walletAddress,
          chain: currentChain ?? null,
          address: evmCfg.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'updateAgentCost',
          args: [agentId, newCostRaw],
        })

        toast.success('Agent attack fee updated successfully!')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', walletAddress] })
        queryClient.invalidateQueries({ queryKey: [AGENT_DETAILS_FULL_QUERY_KEY] })
        onSuccess?.()
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to update agent')
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, currentChain, writeContractAsync, queryClient]
  )

  return { updateCost, isLoading }
}
