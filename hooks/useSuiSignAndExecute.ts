'use client'

import { useCallback } from 'react'
import type { Transaction } from '@mysten/sui/transactions'
import type { SuiTransactionBlockResponse } from '@mysten/sui/jsonRpc'
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@mysten/dapp-kit'
import { toBase64 } from '@mysten/sui/utils'
import { APP_NETWORK } from '@/constants'

interface SuiSignAndExecuteVariables {
  transaction: Transaction
}

interface SuiSignAndExecuteCallbacks {
  onSuccess?: (result: SuiTransactionBlockResponse) => void
  onError?: (error: Error) => void
}

const EXECUTE_OPTIONS = {
  showRawEffects: true,
  showObjectChanges: true,
  showEffects: true,
} as const

/**
 * Sign-and-execute helper for Sui transactions. The connected wallet is the
 * sender and gas payer — gas is selected from the wallet's own coins at build
 * time, exactly like a wallet-built transaction.
 */
export function useSuiSignAndExecute() {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const { mutateAsync: signTransaction } = useSignTransaction()

  const mutate = useCallback(
    (
      variables: SuiSignAndExecuteVariables,
      callbacks?: SuiSignAndExecuteCallbacks
    ) => {
      const { transaction } = variables

      void (async () => {
        if (!account?.address) throw new Error('Wallet not connected')

        transaction.setSender(account.address)
        let bytes: Uint8Array
        try {
          bytes = await transaction.build({ client })
        } catch (error) {
          if (error instanceof Error && error.message.includes('No valid gas coins found')) {
            throw new Error(
              `No SUI gas coins found for ${account.address} on ${APP_NETWORK}. Claim SUI gas credit from your profile or fund your wallet with SUI, and check your wallet is connected to ${APP_NETWORK}.`
            )
          }
          throw error
        }
        const txBytes = toBase64(bytes)
        const { signature } = await signTransaction({
          transaction: txBytes,
          account,
        })

        const result = await client.executeTransactionBlock({
          transactionBlock: txBytes,
          signature,
          options: EXECUTE_OPTIONS,
        })
        callbacks?.onSuccess?.(result)
      })().catch(error => {
        callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)))
      })
    },
    [account, client, signTransaction]
  )

  return { mutate }
}
