'use client'

import { useState, useCallback } from 'react'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { isNativeToken } from '@/lib/evm/native-token'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'

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
  const { requireEvmConfig, writeContract, writeContractAndWait, isWalletConnected } =
    useEvmContractWriter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fundAgent = useCallback(
    async ({ agentId, tokenAddress, amount, decimals, symbol }: FundAgentEVMParams) => {
      setIsLoading(true)
      setError(null)

      const { contractAddress } = requireEvmConfig()
      const amountRaw = parseUnits(String(amount), decimals)
      const isNativeFunding = isNativeToken(tokenAddress)

      try {
        if (!isNativeFunding) {
          if (showToasts) toast.info('Approving token...')
          await writeContractAndWait({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, amountRaw],
          })
        }

        if (showToasts) toast.info('Adding funds...')
        const txHash = await writeContract({
          address: contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'fundAgent',
          args: [agentId, amountRaw],
          value: isNativeFunding ? amountRaw : undefined,
        })

        if (showToasts) toast.success(`Successfully funded agent with ${amount} ${symbol}`)
        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to fund agent')
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [requireEvmConfig, writeContract, writeContractAndWait, onSuccess, onError, showToasts]
  )

  return { fundAgent, isLoading, error, isConnected: isWalletConnected }
}

export type { FundAgentEVMParams, UseFundAgentEVMOptions }
