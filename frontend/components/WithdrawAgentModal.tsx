'use client'
import React, { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { Dialog } from '@/components/Dialog'
import { MIST_PER_SUI } from '@/constants'
import { useWithdrawAgent } from '@/hooks/agents/useWithdrawAgent'

export interface WithdrawAgentModalProps {
  open: boolean
  onClose: () => void
  agentObjectId: string
  agentBalanceInMist: number
  onSuccess?: () => void
}

export const WithdrawAgentModal = ({
  open,
  onClose,
  agentObjectId,
  agentBalanceInMist,
  onSuccess,
}: WithdrawAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const agentBalanceSui = agentBalanceInMist / MIST_PER_SUI

  const { withdrawAgent, isLoading } = useWithdrawAgent()

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
    if (numAmount > agentBalanceSui) {
      setError('Amount cannot exceed agent balance')
      return false
    }

    return true
  }

  const handleWithdraw = async () => {
    if (!validateAmount()) return

    try {
      await withdrawAgent({ agentObjectId, amount: +amount })
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Withdrawal error:', err)
      const message = err instanceof Error ? err.message : 'Failed to withdraw'
      setError(message)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Withdraw Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Amount (SUI)</label>
            <span className="text-xs text-gray-500">Max: {agentBalanceSui.toFixed(4)}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 pr-16 placeholder:text-gray-400 focus:ring-1 focus:ring-black"
              placeholder="0.00"
              min="0"
              step="0.001"
              disabled={isLoading}
            />
            <button
              onClick={() => setAmount(agentBalanceSui.toString())}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium btn btn-outline h-7 px-3"
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
          className="w-full btn btn-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
