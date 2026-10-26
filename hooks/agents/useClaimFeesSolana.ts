'use client'

import { useState, useCallback } from 'react'
import { Transaction, PublicKey } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
} from '@solana/spl-token'
import { toast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { buildClaimFeesInstruction } from '@/lib/solana/program'
import { AGENT_QUERY_KEY } from './useAgentDetails'

interface UseClaimFeesSolanaOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface ClaimFeesSolanaParams {
  agentId: string
  tokenMint: string
}

export const useClaimFeesSolana = (options: UseClaimFeesSolanaOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claimFees = useCallback(
    async ({ agentId, tokenMint }: ClaimFeesSolanaParams) => {
      if (!publicKey) {
        const errorMsg = 'Solana wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      setIsLoading(true)
      setError(null)

      try {
        const mint = new PublicKey(tokenMint)
        const ownerAta = await getAssociatedTokenAddress(mint, publicKey)

        const tx = new Transaction()
        const ataInfo = await connection.getAccountInfo(ownerAta)
        if (!ataInfo) {
          tx.add(
            createAssociatedTokenAccountInstruction(publicKey, ownerAta, publicKey, NATIVE_MINT)
          )
        }

        const claimIx = await buildClaimFeesInstruction({
          agentId,
          ownerTokenAccount: ownerAta,
          owner: publicKey,
        })
        tx.add(claimIx)

        tx.feePayer = publicKey
        const blockhash = await connection.getLatestBlockhash('confirmed')
        tx.recentBlockhash = blockhash.blockhash

        const signature = await sendTransaction(tx, connection)
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          },
          'confirmed'
        )
        if (confirmation.value.err) {
          throw new Error(`claim_fees failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        if (showToasts) toast.success('Fees claimed successfully!')
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', publicKey.toBase58()] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })

        onSuccess?.(signature)
        return signature
      } catch (err) {
        console.error('Error claiming fees on Solana:', err)
        const message = err instanceof Error ? err.message : 'Failed to claim fees'
        setError(message)
        if (showToasts) toast.error(message)
        const final = err instanceof Error ? err : new Error(message)
        onError?.(final)
        throw final
      } finally {
        setIsLoading(false)
      }
    },
    [publicKey, connection, sendTransaction, onSuccess, onError, showToasts, queryClient]
  )

  return {
    claimFees,
    isLoading,
    error,
    isConnected: !!publicKey,
  }
}

export type { ClaimFeesSolanaParams, UseClaimFeesSolanaOptions }
