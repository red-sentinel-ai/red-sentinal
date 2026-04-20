'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'
import { getTokenForCoinType } from '@/constants'
import { useWithdrawAgent } from '@/hooks/agents/useWithdrawAgent'
import { useWithdrawAgentSolana } from '@/hooks/agents/useWithdrawAgentSolana'
import type { SupportedChain } from '@/constants/chains'

export interface WithdrawAgentModalProps {
  open: boolean
  onClose: () => void
  agentObjectId: string
  agentId: string
  agentBalanceRaw: number
  coinType?: string
  onSuccess?: () => void
  chain?: SupportedChain
}

export const WithdrawAgentModal = ({
  open,
  onClose,
  agentObjectId,
  agentId,
  agentBalanceRaw,
  coinType,
  onSuccess,
  chain = 'sui',
}: WithdrawAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const token = getTokenForCoinType(coinType)
  const agentBalanceHuman = agentBalanceRaw / Math.pow(10, token.decimals)
  const isSolana = chain === 'solana'

  const { withdrawAgent: withdrawAgentSui, isLoading: isSuiLoading } = useWithdrawAgent()
  const { withdrawAgent: withdrawAgentSolana, isLoading: isSolanaLoading } = useWithdrawAgentSolana()
  const isLoading = isSolana ? isSolanaLoading : isSuiLoading

  useEffect(() => {
    if (open) {
      setAmount('')
      setError('')
    }
  }, [open])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)

    if (error) {
      setError('')
    }
  }

  const validateAmount = (): boolean => {
    const numAmount = parseFloat(amount)

    if (!amount.trim()) {
      setError('Amount is required')
      return false
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number')
      return false
    }
    if (numAmount > agentBalanceHuman) {
      setError('Amount cannot exceed agent balance')
      return false
    }

    return true
  }

  const handleWithdraw = async () => {
    if (!validateAmount()) return

    try {
      if (isSolana) {
        if (!agentId) throw new Error('Missing agent id')
        if (!coinType) throw new Error('Missing token mint')
        await withdrawAgentSolana({
          agentId,
          tokenMint: coinType,
          amount: +amount,
          decimals: token.decimals,
          symbol: token.symbol,
        })
      } else {
        await withdrawAgentSui({ agentObjectId, agentId, amount: +amount })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Withdrawal error:', err)
      const message = err instanceof Error ? err.message : 'Failed to withdraw'
      setError(message)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-black"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">Amount ({token.symbol})</label>
            <span className="text-xs text-gray-500">Max: {agentBalanceHuman.toFixed(4)}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-16 placeholder:text-gray-400 focus:ring-1 focus:ring-black"
              placeholder="0.00"
              min="0"
              step="0.001"
              disabled={isLoading}
            />
            <button
              onClick={() => setAmount(agentBalanceHuman.toString())}
              className="btn btn-outline absolute right-2 top-1/2 h-7 -translate-y-1/2 px-3 text-xs font-medium"
              disabled={isLoading}
            >
              Max
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isLoading || !amount.trim()}
          className="btn btn-black flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Withdrawing...
            </>
          ) : (
            'Withdraw Funds'
          )}
        </button>
      </div>
    </Dialog>
  )
}
