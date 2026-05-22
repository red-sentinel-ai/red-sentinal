'use client'

import { useState } from 'react'
import { Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import { useDepositToSyndicate } from '@/hooks/syndicate/useDepositToSyndicate'
import { Skeleton } from '@/components/ui/skeleton'

interface SyndicateStep2Props {
  syndicateAddress: `0x${string}`
  tokenAddress: `0x${string}`
  tokenSymbol: string
  tokenDecimals: number
  onComplete: () => void
}

export function SyndicateStep2({
  syndicateAddress,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  onComplete,
}: SyndicateStep2Props) {
  const [amount, setAmount] = useState('')
  const { deposit, isDepositing } = useDepositToSyndicate()
  const { balance, isLoading: isBalanceLoading } = useEVMBalance(tokenAddress)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid deposit amount')
      return
    }

    try {
      await deposit(syndicateAddress, tokenAddress, amount, tokenDecimals)
      toast.success('Deposit successful')
      onComplete()
    } catch (err: any) {
      toast.error(err.message || 'Deposit failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
        <div className="mb-1 flex items-center gap-2">
          <Info className="h-4 w-4 text-[var(--color-gold-primary)]" />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Initial Deposit
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Your deposit becomes the initial bounty pool for the sentinel. Members can add more later.
          You can only withdraw idle funds (not currently locked in an active sentinel).
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Amount ({tokenSymbol})
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            Balance:{' '}
            {isBalanceLoading ? (
              <Skeleton className="inline-block h-3 w-16" />
            ) : (
              <span className="font-medium text-[var(--color-text-primary)]">
                {balance?.toFixed(4) ?? '0.0000'} {tokenSymbol}
              </span>
            )}
          </span>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] focus-within:border-[var(--color-gold-primary)] focus-within:ring-1 focus-within:ring-[var(--color-gold-primary)]">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            step="any"
            min="0"
            className="font-body flex-1 bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:outline-none"
          />
          {balance !== undefined && (
            <button
              type="button"
              onClick={() => setAmount(balance.toFixed(6))}
              className="px-3 text-xs font-medium text-[var(--color-gold-primary)] hover:text-[var(--color-gold-light)]"
            >
              MAX
            </button>
          )}
          <div className="flex items-center border-l border-[var(--color-border-subtle)] px-3">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {tokenSymbol}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isDepositing || !amount}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] shadow-[var(--shadow-card)] transition-all hover:bg-[var(--color-gold-light)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDepositing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Depositing...
          </>
        ) : (
          `Deposit ${tokenSymbol}`
        )}
      </button>
    </form>
  )
}
