import { useCallback, useState } from 'react'
import { useWalletContext } from '@/lib/wallet/context'
import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'

interface UseUnifiedSignTransactionOptions {
  onSuccess?: (result: SuiTransactionBlockResponse) => void
  onError?: (error: Error) => void
}

export function useUnifiedSignTransaction(options?: UseUnifiedSignTransactionOptions) {
  const { signAndExecuteTransaction } = useWalletContext()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    (
      { transaction }: { transaction: Transaction },
      callbacks?: {
        onSuccess?: (result: SuiTransactionBlockResponse) => void
        onError?: (error: Error) => void
      }
    ) => {
      setIsPending(true)
      signAndExecuteTransaction(transaction)
        .then(result => {
          callbacks?.onSuccess?.(result)
          options?.onSuccess?.(result)
        })
        .catch(error => {
          const err = error instanceof Error ? error : new Error(String(error))
          callbacks?.onError?.(err)
          options?.onError?.(err)
        })
        .finally(() => {
          setIsPending(false)
        })
    },
    [signAndExecuteTransaction, options]
  )

  const mutateAsync = useCallback(
    async ({ transaction }: { transaction: Transaction }) => {
      setIsPending(true)
      try {
        const result = await signAndExecuteTransaction(transaction)
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        options?.onError?.(err)
        throw err
      } finally {
        setIsPending(false)
      }
    },
    [signAndExecuteTransaction, options]
  )

  return { mutate, mutateAsync, isPending }
}
