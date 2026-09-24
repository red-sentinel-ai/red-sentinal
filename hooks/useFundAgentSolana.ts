'use client'

import { useState, useCallback } from 'react'
import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  createSyncNativeInstruction,
} from '@solana/spl-token'
import { toast } from 'sonner'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import { NATIVE_SOL_MINT } from '@/constants/solana'
import { buildFundAgentInstruction } from '@/lib/solana/program'

interface UseFundAgentSolanaOptions {
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentSolanaParams {
  agentId: string
  tokenMint: string
  amount: number
  decimals: number
  symbol: string
}

export const useFundAgentSolana = (options: UseFundAgentSolanaOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fundAgent = useCallback(
    async ({ agentId, tokenMint, amount, decimals, symbol }: FundAgentSolanaParams) => {
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
        const isNativeSol = tokenMint === NATIVE_SOL_MINT
        const amountRaw = BigInt(Math.floor(amount * Math.pow(10, decimals)))

        const ownerAta = await getAssociatedTokenAddress(mint, publicKey)
        const tx = new Transaction()

        if (isNativeSol) {
          const ataInfo = await connection.getAccountInfo(ownerAta)
          if (!ataInfo) {
            tx.add(
              createAssociatedTokenAccountInstruction(publicKey, ownerAta, publicKey, NATIVE_MINT)
            )
          }
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: ownerAta,
              lamports: amountRaw,
            })
          )
          tx.add(createSyncNativeInstruction(ownerAta))
        }

        const fundIx = await buildFundAgentInstruction({
          agentId,
          amount: amountRaw,
          ownerTokenAccount: ownerAta,
          owner: publicKey,
        })
        tx.add(fundIx)

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
          throw new Error(`fund_agent failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        if (showToasts) toast.success(`Successfully funded agent with ${amount} ${symbol}`)
        onSuccess?.(signature)
        return signature
      } catch (err) {
        console.error('Error funding Solana agent:', err)
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
    [publicKey, connection, sendTransaction, onSuccess, onError, showToasts]
  )

  return {
    fundAgent,
    isLoading,
    error,
    isConnected: !!publicKey,
  }
}

export type { FundAgentSolanaParams, UseFundAgentSolanaOptions }
