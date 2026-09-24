'use client'

import { useState, useCallback } from 'react'
import { Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSolanaWallet, useSolanaConnection } from '@/hooks/useSolanaWallet'
import {
  buildUpdateAgentCostInstruction,
  buildUpdateAgentPromptHashInstruction,
} from '@/lib/solana/program'
import { sha256 } from '@/lib/solana/utils'
import { AGENT_QUERY_KEY } from './useAgentDetails'

export const useUpdateAgentSolana = () => {
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { connection } = useSolanaConnection()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const sendInstruction = useCallback(
    async (
      buildTx: (tx: Transaction) => Promise<void>,
      successMessage: string,
      onSuccess?: () => void
    ) => {
      if (!publicKey) {
        toast.error('Solana wallet not connected')
        return
      }

      setIsLoading(true)
      try {
        const tx = new Transaction()
        await buildTx(tx)

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
          throw new Error(`Update failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        toast.success(successMessage)
        queryClient.invalidateQueries({ queryKey: ['agents-by-owner', publicKey.toBase58()] })
        queryClient.invalidateQueries({ queryKey: [AGENT_QUERY_KEY] })
        onSuccess?.()
      } catch (error: any) {
        console.error('Solana update error:', error)
        toast.error(error?.message ?? 'Failed to update agent')
      } finally {
        setIsLoading(false)
      }
    },
    [publicKey, connection, sendTransaction, queryClient]
  )

  const updatePrompt = useCallback(
    async (agentId: string, newPrompt: string, onSuccess?: () => void) => {
      if (!publicKey) {
        toast.error('Solana wallet not connected')
        return
      }
      const newPromptHash = await sha256(newPrompt)

      await sendInstruction(
        async tx => {
          const ix = await buildUpdateAgentPromptHashInstruction({
            agentId,
            newPromptHash,
            owner: publicKey,
          })
          tx.add(ix)
        },
        'Agent prompt updated successfully!',
        onSuccess
      )
    },
    [publicKey, sendInstruction]
  )

  const updateCost = useCallback(
    async (agentId: string, newCostRaw: bigint, onSuccess?: () => void) => {
      if (!publicKey) {
        toast.error('Solana wallet not connected')
        return
      }

      await sendInstruction(
        async tx => {
          const ix = await buildUpdateAgentCostInstruction({
            agentId,
            newCost: newCostRaw,
            owner: publicKey,
          })
          tx.add(ix)
        },
        'Agent attack fee updated successfully!',
        onSuccess
      )
    },
    [publicKey, sendInstruction]
  )

  return {
    updatePrompt,
    updateCost,
    isLoading,
  }
}
