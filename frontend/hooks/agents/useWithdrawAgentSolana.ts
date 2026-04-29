'use client'

import { useState, useCallback } from 'react'
import { Transaction, PublicKey } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
} from '@solana/spl-token'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { buildWithdrawFromAgentInstruction } from '@/lib/solana/program'
import { AGENT_DETAILS_FULL_QUERY_KEY } from './useAgentDetails'

interface UseWithdrawAgentSolanaOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface WithdrawAgentSolanaParams {
  agentId: string
  tokenMint: string
  amount: number
  decimals: number
  symbol: string
}

export const useWithdrawAgentSolana = (options: UseWithdrawAgentSolanaOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()
  const queryClient = useQueryClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdrawAgent = useCallback(
    async ({ agentId, tokenMint, amount, decimals, symbol }: WithdrawAgentSolanaParams) => {
      if (!publicKey) {
        const errorMsg = 'Solana wallet not connected'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      if (!agentId || !amount || amount <= 0) {
        const errorMsg = 'Invalid agent id or amount'
        setError(errorMsg)
        if (showToasts) toast.error(errorMsg)
        throw new Error(errorMsg)
      }

      setIsLoading(true)
      setError(null)

      try {
        const mint = new PublicKey(tokenMint)
        const amountRaw = BigInt(Math.round(amount * Math.pow(10, decimals)))
        const ownerAta = await getAssociatedTokenAddress(mint, publicKey)

        const tx = new Transaction()
        const ataInfo = await connection.getAccountInfo(ownerAta)
        if (!ataInfo) {
          tx.add(
            createAssociatedTokenAccountInstruction(publicKey, ownerAta, publicKey, NATIVE_MINT)
          )
        }

        const withdrawIx = await buildWithdrawFromAgentInstruction({
          agentId,
          amount: amountRaw,
          ownerTokenAccount: ownerAta,
          owner: publicKey,
        })
        tx.add(withdrawIx)

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
          throw new Error(`withdraw_from_agent failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        if (showToasts) toast.success(`Successfully withdrew ${amount} ${symbol}`)

        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', publicKey.toBase58()] })
        queryClient.invalidateQueries({ queryKey: [AGENT_DETAILS_FULL_QUERY_KEY] })

        onSuccess?.(signature)
        return signature
      } catch (err) {
        console.error('Error withdrawing from Solana agent:', err)
        const message = err instanceof Error ? err.message : 'Failed to withdraw from agent'
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
    withdrawAgent,
    isLoading,
    error,
    isConnected: !!publicKey,
  }
}

export type { WithdrawAgentSolanaParams, UseWithdrawAgentSolanaOptions }
