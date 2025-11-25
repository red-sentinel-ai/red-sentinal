'use client'
import React, { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import posthog from 'posthog-js'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import { useFundAgent } from '@/hooks/useFundAgent'

export interface FundAgentModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when the modal should close */
  onClose: () => void
  /** Agent object ID to fund */
  agentObjectId: string
  /** Optional callback when funding is successful, receives the amount */
  onSuccess?: (amount: string) => void
}

export const FundAgentModal = ({
  open,
  onClose,
  agentObjectId,
  onSuccess,
}: FundAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const account = useCurrentAccount()

  const { fundAgent, isLoading } = useFundAgent()

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

    if (numAmount < 0.001) {
      setError('Minimum amount is 0.001 SUI')
      return false
    }

    return true
  }

  const handleFundAgent = async () => {
    if (!validateAmount()) return

    try {
      await fundAgent({ agentObjectId, amount: +amount })

      posthog.capture('sentinel_funded', {
        agent_object_id: agentObjectId,
        amount_sui: parseFloat(amount),
        funder_address: account?.address, // You might need to grab this via useCurrentAccount inside this component
      })

      onSuccess?.(amount)

      setAmount('')
      setError('')
    } catch (err) {
      console.error('Funding error:', err)
      const message = err instanceof Error ? err.message : 'Failed to fund agent'
      setError(message)
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Funds</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (SUI)</label>
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 placeholder:text-gray-400 focus:ring-1 focus:ring-black"
            placeholder="0.00"
            min="0"
            step="0.001"
            disabled={isLoading}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        <button
          onClick={handleFundAgent}
          disabled={isLoading || !amount.trim()}
          className="w-full btn btn-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Adding Funds...
            </>
          ) : (
            'Add Funds'
          )}
        </button>
      </div>
    </Dialog>
  )
}
