/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { AGENT_DETAILS_QUERY_KEY } from './useAgentBySlug'
import { useUnifiedWallet } from '../useUnifiedWallet'
import { useWalletContext } from '@/lib/wallet/context'

interface UseWithdrawAgentOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface WithdrawAgentParams {
  agentObjectId: string
  amount: number // Amount in SUI
}

export const useWithdrawAgent = (options: UseWithdrawAgentOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const client = useSuiClient()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)

  const { address, isConnected } = useUnifiedWallet()
  const { signAndExecuteTransaction } = useWalletContext()

  const withdrawAgent = useCallback(
    async ({ agentObjectId, amount }: WithdrawAgentParams) => {
      if (!address) {
        const errorMsg = 'Wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      if (!agentObjectId || !amount || amount <= 0) {
        const errorMsg = 'Invalid agent ID or amount'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const tx = new Transaction()
        const amountInMist = BigInt(Math.floor(amount * MIST_PER_SUI))

        tx.moveCall({
          target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::withdraw_from_agent`,
          arguments: [
            tx.object(agentObjectId),
            tx.pure.u64(amountInMist),
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        })

        const result = await signAndExecuteTransaction(tx)
        console.log('Withdraw agent transaction success:', result)
        setLastResult(result)

        if (showToasts) {
          toast.success(`Successfully withdrew ${amount} SUI`)
        }

        // Refetch agent data
        queryClient.invalidateQueries({
          queryKey: ['agents-by-owner', address],
        })
        queryClient.invalidateQueries({
          queryKey: [AGENT_DETAILS_QUERY_KEY],
        })

        onSuccess?.(result)
        return result
      } catch (error) {
        console.error('Error withdrawing from agent:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to withdraw from agent'
        setError(errorMessage)

        if (showToasts) {
          toast.error(errorMessage)
        }

        const finalError = error instanceof Error ? error : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
      }
    },
    [address, signAndExecuteTransaction, onSuccess, onError, showToasts, queryClient]
  )

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
  }, [])

  return {
    withdrawAgent,
    isLoading,
    error,
    lastResult,
    reset,
    isConnected,
  }
}
