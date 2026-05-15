'use client'

import { useState, useCallback } from 'react'
import { useWriteContract, useAccount } from 'wagmi'
import { toast } from 'sonner'
import { BNB_CONFIG } from '@/constants/evm'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { useEVMWallet } from '@/hooks/useEVMWallet'

interface UseFundAgentEVMOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentEVMParams {
  agentId: string
  tokenAddress: string
  amount: number
  decimals: number
  symbol: string
}

export const useFundAgentEVM = (options: UseFundAgentEVMOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { address: walletAddress } = useEVMWallet()
  const { chain: currentChain } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fundAgent = useCallback(
    async ({ agentId, tokenAddress, amount, decimals, symbol }: FundAgentEVMParams) => {
      if (!walletAddress) {
        const msg = 'EVM wallet not connected'
        setError(msg)
        if (showToasts) toast.error(msg)
        throw new Error(msg)
      }

      setIsLoading(true)
      setError(null)

      const txArgs = { account: walletAddress, chain: currentChain ?? null }
      const amountRaw = BigInt(Math.floor(amount * Math.pow(10, decimals)))

      try {
        if (showToasts) toast.info('Approving token...')
        await writeContractAsync({
          ...txArgs,
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [BNB_CONFIG.contractAddress, amountRaw],
        })

        await new Promise(r => setTimeout(r, 3000))

        if (showToasts) toast.info('Adding funds...')
        const txHash = await writeContractAsync({
          ...txArgs,
          address: BNB_CONFIG.contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'fundAgent',
          args: [agentId, amountRaw],
        })

        if (showToasts) toast.success(`Successfully funded agent with ${amount} ${symbol}`)
        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fund agent'
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, currentChain, writeContractAsync, onSuccess, onError, showToasts]
  )

  return { fundAgent, isLoading, error, isConnected: !!walletAddress }
}

export type { FundAgentEVMParams, UseFundAgentEVMOptions }
