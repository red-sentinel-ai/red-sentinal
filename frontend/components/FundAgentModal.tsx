'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import posthog from 'posthog-js'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import { useFundAgent } from '@/hooks/useFundAgent'
import { getDefenderBoosterTier } from '@/lib/earn-utils'
import { BoosterPassBadge } from '@/components/BoosterPassBadge'

export interface FundAgentModalProps {
  open: boolean
  onClose: () => void
  agentObjectId: string
  onSuccess?: (amount: string) => void
  agentId: string | null
}

export const FundAgentModal = ({
  open,
  onClose,
  agentObjectId,
  onSuccess,
  agentId,
}: FundAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [funded, setFunded] = useState(false)
  const [fundedTier, setFundedTier] = useState('')
  const account = useCurrentAccount()

  const { fundAgent, isLoading } = useFundAgent()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    if (error) setError('')
  }

  const validateAmount = (): boolean => {
    const num = parseFloat(amount)
    if (!amount.trim()) { setError('Amount is required'); return false }
    if (isNaN(num) || num <= 0) { setError('Amount must be a positive number'); return false }
    if (num < 0.001) { setError('Minimum amount is 0.001 SUI'); return false }
    return true
  }

  const handleFundAgent = async () => {
    if (!validateAmount()) return

    try {
      await fundAgent({ agentObjectId, amount: +amount, agentId })

      posthog.capture('sentinel_funded', {
        agent_object_id: agentObjectId,
        amount_sui: parseFloat(amount),
        funder_address: account?.address,
      })

      const tier = getDefenderBoosterTier(parseFloat(amount))
      setFundedTier(tier)
      setFunded(true)
      onSuccess?.(amount)
      setAmount('')
      setError('')
    } catch (err) {
      console.error('Funding error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fund agent')
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    setFunded(false)
    setFundedTier('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {funded ? (
        <div className="space-y-5 text-center">
          <div className="flex items-center justify-between">
            <span className="w-6" />
            <h2 className="flex-grow text-center text-xl font-bold">Sentinel Funded!</h2>
            <button onClick={handleClose} className="text-gray-400 transition-colors hover:text-black">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image
              src="/img/slot_machine_1x.png"
              alt="Slot machine"
              width={56}
              height={74}
              className="h-14 w-14"
            />
            <p className="font-semibold text-black">Free Spin Pass Received!</p>
            <BoosterPassBadge tierKey={fundedTier} mode="received" />
            <p className="text-xs text-gray-500">
              Use it to WIN SENTINEL tokens from your profile rewards tab.
            </p>
          </div>

          <Link
            href="/profile?tab=rewards"
            onClick={handleClose}
            className="inline-block w-full rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Go to Profile → Spin Now
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Fund Your Sentinel</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 transition-colors hover:text-black"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600">
            Add funds to your reward pool to list your sentinel on the attack page. The bigger the
            bounty, the more attackers you&apos;ll attract.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium">Amount (SUI)</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 placeholder:text-gray-400 focus:ring-1 focus:ring-black [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0.00"
              min="0"
              step="0.001"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <p className="text-xs text-gray-500">
            Sentinels with less than 0.1 SUI balance won&apos;t be visible to attackers.
          </p>

          <button
            onClick={handleFundAgent}
            disabled={isLoading || !amount.trim()}
            className="btn btn-black flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Funds...
              </>
            ) : (
              'Add Funds'
            )}
          </button>
        </div>
      )}
    </Dialog>
  )
}
