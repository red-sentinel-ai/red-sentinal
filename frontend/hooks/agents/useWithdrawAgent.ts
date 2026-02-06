/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { MIST_PER_SUI, SUI_CONFIG } from '@/constants'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { AGENT_DETAILS_QUERY_KEY } from './useAgentBySlug'

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

  const account = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  })

  const withdrawAgent = useCallback(
    async ({ agentObjectId, amount }: WithdrawAgentParams) => {
      if (!account?.address) {
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

        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: result => {
                console.log('Withdraw agent transaction success:', result)
                setLastResult(result)

                if (showToasts) {
                  toast.success(`Successfully withdrew ${amount} SUI`)
                }

                // Refetch agent data
                queryClient.invalidateQueries({
                  queryKey: ['agents-by-owner', account?.address],
                })
                queryClient.invalidateQueries({
                  queryKey: [AGENT_DETAILS_QUERY_KEY],
                })

                onSuccess?.(result)
                resolve(result)
              },
              onError: txError => {
                console.error('Transaction failed:', txError)
                const errorMsg = 'Transaction failed: ' + txError.message
                setError(errorMsg)

                if (showToasts) {
                  toast.error(errorMsg)
                }

                const error = new Error(errorMsg)
                onError?.(error)
                reject(error)
              },
            }
          )
        })
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
    [account?.address, signAndExecuteTransaction, onSuccess, onError, showToasts, queryClient]
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
    isConnected: !!account?.address,
  }
}
