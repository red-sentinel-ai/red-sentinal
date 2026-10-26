'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useStellarWallet } from './useStellarWallet'
import { stellarInvoke } from '@/lib/stellar/client'

interface UseFundAgentStellarOptions {
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface FundAgentStellarParams {
  agentId: string
  amount: number
  symbol?: string
}

/**
 * Tops up a Sentinel's bounty pool on Stellar with native XLM. Only the agent
 * owner can fund (donations are a separate contract entry point).
 */
export const useFundAgentStellar = (options: UseFundAgentStellarOptions = {}) => {
  const { onSuccess, onError, showToasts = true } = options
  const { address, signTransaction } = useStellarWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fundAgent = useCallback(
    async ({ agentId, amount, symbol = 'XLM' }: FundAgentStellarParams) => {
      const XLM_DECIMALS = 7

      if (!address || !signTransaction) {
        const errorMsg = 'Stellar wallet not connected'
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
        const amountRaw = BigInt(Math.floor(amount * Math.pow(10, XLM_DECIMALS)))
        const txHash = await stellarInvoke(
          { address, signTransaction },
          'fund_agent',
          {
            owner: address,
            agent_id: agentId,
            amount: amountRaw,
          }
        )

        if (showToasts) toast.success(`Sentinel funded with ${amount} ${symbol}`)
        onSuccess?.(txHash)
        return txHash
      } catch (err) {
        console.error('Error funding Stellar agent:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to fund agent'
        setError(errorMessage)
        if (showToasts) toast.error(errorMessage)
        const finalError = err instanceof Error ? err : new Error(errorMessage)
        onError?.(finalError)
        throw finalError
      } finally {
        setIsLoading(false)
      }
    },
    [address, signTransaction, onSuccess, onError, showToasts]
  )

  return { fundAgent, isLoading, error, isConnected: !!address }
}
