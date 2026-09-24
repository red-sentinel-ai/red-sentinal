'use client'

import Image from 'next/image'
import { Loader2, X } from 'lucide-react'
import { CHAINS, type SupportedChain } from '@/constants/chains'
import type { SupportedToken } from '@/constants/shared'

interface DonateFundsFormProps {
  agentName: string | null
  token: SupportedToken
  amount: string
  error: string
  isSubmitting: boolean
  /** Set when the app is pointed at a different chain than the sentinel lives on. */
  chainToSwitch: SupportedChain | null
  onAmountChange: (amount: string) => void
  onSubmit: () => void
  onSwitchChain: (chain: SupportedChain) => void
  onClose: () => void
}

export const DonateFundsForm = ({
  agentName,
  token,
  amount,
  error,
  isSubmitting,
  chainToSwitch,
  onAmountChange,
  onSubmit,
  onSwitchChain,
  onClose,
}: DonateFundsFormProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Donate to the Bounty
      </h2>
      <button
        onClick={onClose}
        className="text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-primary)]"
        disabled={isSubmitting}
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <p className="text-xs text-[var(--color-text-secondary)]">
      Anyone can grow {agentName}&apos;s reward pool. Your donation goes straight to the bounty an
      attacker wins by breaking it — it is not refundable and does not extend the owner&apos;s
      withdrawal lock.
    </p>

    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)]">
        Amount
        <Image src={token.icon} alt={token.symbol} width={16} height={16} className="rounded-full" />
        {token.symbol}
      </label>
      <input
        type="number"
        value={amount}
        onChange={event => onAmountChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:ring-1 focus:ring-[var(--color-gold-primary)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        placeholder="0.00"
        min="0"
        step="0.001"
        disabled={isSubmitting || !!chainToSwitch}
      />
      {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
    </div>

    {chainToSwitch ? (
      <button
        onClick={() => onSwitchChain(chainToSwitch)}
        className="btn btn-black flex w-full items-center justify-center"
      >
        Switch to {CHAINS[chainToSwitch].name}
      </button>
    ) : (
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !amount.trim()}
        className="btn btn-black flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Donation...
          </>
        ) : (
          'Donate Funds'
        )}
      </button>
    )}
  </div>
)
