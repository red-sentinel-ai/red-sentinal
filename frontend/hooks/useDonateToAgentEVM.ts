'use client'

import { useState, useCallback } from 'react'
import { parseUnits } from 'viem'
import { toast } from 'sonner'
import { SENTINEL_ABI, ERC20_ABI } from '@/lib/evm/abi'
import { toReadableEvmError } from '@/lib/evm/errors'
import { isNativeToken } from '@/lib/evm/native-token'
import { useEvmContractWriter } from '@/hooks/evm/useEvmContractWriter'

interface UseDonateToAgentEVMOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface DonateToAgentEVMParams {
  agentId: string
  tokenAddress: string
  amount: number
  decimals: number
  symbol: string
}

/**
 * Permissionless bounty top-up for an EVM sentinel.
 *
 * Mirrors useFundAgentEVM but calls `donateToAgent`, which requires no
 * ownership and leaves the owner's withdrawal lock untouched. The sentinel must
 * be live on-chain — the contract reverts for defeated or paused agents — and
 * the chain must have a deployment that exposes the function (see
 * `supportsDonations` in constants/evm.ts).
 */
export const useDonateToAgentEVM = (options: UseDonateToAgentEVMOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { requireEvmConfig, writeContract, writeContractAndWait, isWalletConnected } =
    useEvmContractWriter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const donateToAgent = useCallback(
    async ({ agentId, tokenAddress, amount, decimals, symbol }: DonateToAgentEVMParams) => {
      setIsLoading(true)
      setError(null)

      const { contractAddress } = requireEvmConfig()
      const amountRaw = parseUnits(String(amount), decimals)
      const isNativeDonation = isNativeToken(tokenAddress)

      try {
        if (!isNativeDonation) {
          if (showToasts) toast.info('Approving token...')
          await writeContractAndWait({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, amountRaw],
          })
        }

        if (showToasts) toast.info('Sending donation...')
        const txHash = await writeContract({
          address: contractAddress,
          abi: SENTINEL_ABI,
          functionName: 'donateToAgent',
          args: [agentId, amountRaw],
          value: isNativeDonation ? amountRaw : undefined,
        })

        if (showToasts) toast.success(`Donated ${amount} ${symbol} to the bounty`)
        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        const message = toReadableEvmError(err, 'Failed to donate to sentinel')
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

  return { donateToAgent, isLoading, error, isConnected: isWalletConnected }
}

export type { DonateToAgentEVMParams, UseDonateToAgentEVMOptions }
