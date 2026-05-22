'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, X } from 'lucide-react'
import posthog from 'posthog-js'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Dialog } from '@/components/Dialog'
import { useFundAgent } from '@/hooks/useFundAgent'
import { useFundAgentSolana } from '@/hooks/useFundAgentSolana'
import { useFundAgentEVM } from '@/hooks/useFundAgentEVM'
import { useSolanaWallet } from '@/hooks/useSolanaWallet'
import { useEVMWallet } from '@/hooks/useEVMWallet'
import { getTokenForCoinType } from '@/constants'
import { getDefenderBoosterTier } from '@/lib/earn-utils'
import { BoosterPassBadge } from '@/components/BoosterPassBadge'
import type { SupportedChain } from '@/constants/chains'

export interface FundAgentModalProps {
  open: boolean
  onClose: () => void
  agentObjectId: string
  onSuccess?: (amount: string) => void
  agentId: string | null
  /** Token to fund with (defaults to USDC) */
  coinType?: string
  tokenSymbol?: string
  tokenDecimals?: number
  chain?: SupportedChain
}

export const FundAgentModal = ({
  open,
  onClose,
  agentObjectId,
  onSuccess,
  agentId,
  coinType = '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
  tokenSymbol = 'USDC',
  tokenDecimals = 6,
  chain = 'sui',
}: FundAgentModalProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [funded, setFunded] = useState(false)
  const [fundedTier, setFundedTier] = useState('')
  const account = useCurrentAccount()
  const { publicKey: solanaPublicKey } = useSolanaWallet()
  const { address: evmAddress } = useEVMWallet()
  const token = getTokenForCoinType(coinType)
  const isSolana = chain === 'solana'
  const isEvm = chain === 'bnb'

  const { fundAgent: fundAgentSui, isLoading: isSuiLoading } = useFundAgent()
  const { fundAgent: fundAgentSolana, isLoading: isSolanaLoading } = useFundAgentSolana()
  const { fundAgent: fundAgentEvm, isLoading: isEvmLoading } = useFundAgentEVM()
  const isLoading = isEvm ? isEvmLoading : isSolana ? isSolanaLoading : isSuiLoading

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
      if (isEvm) {
        if (!agentId) throw new Error('Missing agent id')
        await fundAgentEvm({
          agentId,
          tokenAddress: coinType,
          amount: +amount,
          decimals: tokenDecimals,
          symbol: tokenSymbol,
        })
      } else if (isSolana) {
        if (!agentId) throw new Error('Missing agent id')
        await fundAgentSolana({
          agentId,
          tokenMint: coinType,
          amount: +amount,
          decimals: tokenDecimals,
          symbol: tokenSymbol,
        })
      } else {
        await fundAgentSui({
          agentObjectId,
          amount: +amount,
          agentId,
          coinType,
          decimals: tokenDecimals,
          symbol: tokenSymbol,
        })
      }

      const funderAddress = isEvm ? evmAddress : isSolana ? solanaPublicKey?.toBase58() : account?.address
      posthog.capture('sentinel_funded', {
        agent_object_id: agentObjectId,
        amount_sui: parseFloat(amount),
        funder_address: funderAddress,
        chain,
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
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-between">
            <span className="w-4" />
            <h2 className="flex-grow text-center text-sm font-semibold text-[var(--color-text-primary)]">Sentinel Funded!</h2>
            <button onClick={handleClose} className="text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-primary)]">
              <X className="h-4 w-4" />
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
            <p className="font-semibold text-[var(--color-text-primary)]">Free Spin Pass Received!</p>
            <BoosterPassBadge tierKey={fundedTier} mode="received" />
            <p className="text-xs text-[var(--color-text-muted)]">
              Use it to WIN SENTINEL tokens from your profile rewards tab.
            </p>
          </div>

          <Link
            href="/profile?tab=rewards"
            onClick={handleClose}
            className="inline-block w-full rounded-lg bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-bg-surface)] transition-transform hover:scale-105"
          >
            Go to Profile → Spin Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Fund Your Sentinel</h2>
            <button
              onClick={handleClose}
              className="text-[var(--color-text-faint)] transition-colors hover:text-[var(--color-text-primary)]"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)]">
            Add funds to your reward pool to list your sentinel on the attack page. The bigger the
            bounty, the more attackers you&apos;ll attract.
          </p>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)]">
              Amount
              <Image src={token.icon} alt={tokenSymbol} width={16} height={16} className="rounded-full" />
              {tokenSymbol}
            </label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:ring-1 focus:ring-[var(--color-gold-primary)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0.00"
              min="0"
              step="0.001"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>}
          </div>

          <p className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
            Sentinels with less than 0.1
            <Image src={token.icon} alt={tokenSymbol} width={12} height={12} className="rounded-full" />
            {tokenSymbol} balance won&apos;t be visible to attackers.
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
