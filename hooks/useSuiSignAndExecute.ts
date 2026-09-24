'use client'

import { useCallback } from 'react'
import type { Transaction } from '@mysten/sui/transactions'
import type { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@mysten/dapp-kit'
import { toBase64 } from '@mysten/sui/utils'
import { APP_NETWORK, SPONSORED_GAS_ENABLED, SUI_SENTINEL_API_URL } from '@/constants'
import { useAuth } from '@/context/AuthContext'

interface SuiSignAndExecuteVariables {
  transaction: Transaction
}

interface SuiSignAndExecuteCallbacks {
  onSuccess?: (result: SuiTransactionBlockResponse) => void
  onError?: (error: Error) => void
}

interface SponsorResponse {
  txBytes: string
  sponsorSignature: string
  sponsorAddress: string
  digest: string
  gasBudget: number
}

const EXECUTE_OPTIONS = {
  showRawEffects: true,
  showObjectChanges: true,
  showEffects: true,
} as const

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    if (body?.message) return body.message
  } catch {
    // Fall through to the status text below.
  }
  return `Gas sponsorship failed (${response.status})`
}

interface UseSuiSignAndExecuteOptions {
  /** Set to false to always pay gas from the user's wallet, skipping the sponsor. */
  sponsored?: boolean
}

/**
 * Drop-in replacement for dapp-kit's `useSignAndExecuteTransaction` that routes
 * gas payment through the backend sponsor.
 *
 * The flow is the user-proposed sponsored transaction flow from the Sui docs:
 *  1. build the transaction kind only (no sender/gas),
 *  2. ask the backend to attach sponsor gas and sign it,
 *  3. sign the sponsored bytes with the user's wallet,
 *  4. submit with both signatures.
 *
 * If the user is signed out, sponsorship is disabled, or the sponsor endpoint
 * is unavailable, it transparently falls back to paying gas from the user's own
 * wallet so the transaction still goes through.
 */
export function useSuiSignAndExecute({ sponsored: sponsoredOption = true }: UseSuiSignAndExecuteOptions = {}) {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const { user } = useAuth()
  const { mutateAsync: signTransaction } = useSignTransaction()

  const executeOwnGas = useCallback(
    async (transaction: Transaction): Promise<SuiTransactionBlockResponse> => {
      if (!account?.address) throw new Error('Wallet not connected')

      transaction.setSender(account.address)
      let bytes: Uint8Array
      try {
        bytes = await transaction.build({ client })
      } catch (error) {
        if (error instanceof Error && error.message.includes('No valid gas coins found')) {
          throw new Error(
            `No SUI gas coins found for ${account.address} on ${APP_NETWORK}. Check that your wallet is connected to ${APP_NETWORK} and has SUI.`
          )
        }
        throw error
      }
      const txBytes = toBase64(bytes)
      const { signature } = await signTransaction({
        transaction: txBytes,
        account,
      })

      return client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature,
        options: EXECUTE_OPTIONS,
      })
    },
    [account, client, signTransaction]
  )

  const executeSponsored = useCallback(
    async (transaction: Transaction): Promise<SuiTransactionBlockResponse> => {
      if (!account?.address) throw new Error('Wallet not connected')
      if (!user?.id) throw new Error('Sign in required for sponsored gas')

      const kindBytes = await transaction.build({ client, onlyTransactionKind: true })

      const response = await fetch(
        `${SUI_SENTINEL_API_URL}/sponsor/${APP_NETWORK}/sui`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            sender: account.address,
            txKind: toBase64(kindBytes),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const sponsored = (await response.json()) as SponsorResponse
      const { signature: userSignature } = await signTransaction({
        transaction: sponsored.txBytes,
        account,
      })

      return client.executeTransactionBlock({
        transactionBlock: sponsored.txBytes,
        // Sui accepts participant signatures in any order.
        signature: [userSignature, sponsored.sponsorSignature],
        options: EXECUTE_OPTIONS,
      })
    },
    [account, client, signTransaction, user?.id]
  )

  const mutate = useCallback(
    (
      variables: SuiSignAndExecuteVariables,
      callbacks?: SuiSignAndExecuteCallbacks
    ) => {
      const { transaction } = variables

      void (async () => {
        const shouldSponsor = sponsoredOption && SPONSORED_GAS_ENABLED && !!user?.id

        if (shouldSponsor) {
          try {
            const result = await executeSponsored(transaction)
            callbacks?.onSuccess?.(result)
            return
          } catch (error) {
            // Never block a user because sponsorship hiccupped — fall back to
            // their own gas, which is the pre-sponsorship behaviour.
            console.warn('Gas sponsorship unavailable, falling back to user gas:', error)

            try {
              const result = await executeOwnGas(transaction)
              callbacks?.onSuccess?.(result)
              return
            } catch (fallbackError) {
              // Both paths failed: surface the sponsor reason too, otherwise
              // the user only sees the fallback error (e.g. a wallet dry-run
              // gas failure) with no hint that sponsorship was even attempted.
              const sponsorReason = error instanceof Error ? error.message : String(error)
              const fallbackReason =
                fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
              throw new Error(
                `Gas sponsorship unavailable: ${sponsorReason}. Paying gas from your own wallet also failed: ${fallbackReason}`
              )
            }
          }
        }

        const result = await executeOwnGas(transaction)
        callbacks?.onSuccess?.(result)
      })().catch(error => {
        callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)))
      })
    },
    [executeOwnGas, executeSponsored, sponsoredOption, user?.id]
  )

  return { mutate }
}
