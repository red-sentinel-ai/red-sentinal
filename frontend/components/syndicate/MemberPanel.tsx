'use client'

import { useState } from 'react'
import { Loader2, Coins, LogIn, Gift, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatUnits } from 'viem'
import { useSyndicateMemberActions } from '@/hooks/syndicate/useSyndicateMemberActions'
import { Skeleton } from '@/components/ui/skeleton'

interface MemberPanelProps {
  syndicateAddress: `0x${string}`
  tokenAddress: `0x${string}`
  tokenSymbol: string
  tokenDecimals: number
  whitelistEnabled: boolean
  isWhitelisted: boolean | undefined
  shares: bigint | undefined
  pendingFees: bigint | undefined
  idlePrincipal: bigint | undefined
  isLoadingMember: boolean
  hasAgent: boolean
  onRefresh: () => void
}

export function MemberPanel({
  syndicateAddress,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  whitelistEnabled,
  isWhitelisted,
  shares,
  pendingFees,
  idlePrincipal,
  isLoadingMember,
  hasAgent,
  onRefresh,
}: MemberPanelProps) {
  const { deposit, redeem, claimFeesForSyndicate, claimFeesForSelf, requestToJoin, loading } =
    useSyndicateMemberActions(syndicateAddress)

  const [depositAmount, setDepositAmount] = useState('')
  const [redeemShares, setRedeemShares] = useState('')
  const [joinMessage, setJoinMessage] = useState('')
  const [joinSent, setJoinSent] = useState(false)

  const formattedShares = shares !== undefined ? formatUnits(shares, tokenDecimals) : null
  const formattedPendingFees =
    pendingFees !== undefined ? formatUnits(pendingFees, tokenDecimals) : null
  const formattedIdlePrincipal =
    idlePrincipal !== undefined ? formatUnits(idlePrincipal, tokenDecimals) : null

  // Compute max redeemable shares based on idle principal
  const handleDeposit = async () => {
    if (!depositAmount) return
    try {
      await deposit(tokenAddress, depositAmount, tokenDecimals)
      toast.success('Deposit successful')
      setDepositAmount('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleRedeem = async () => {
    if (!redeemShares) return
    const sharesBigInt = BigInt(Math.floor(parseFloat(redeemShares) * 10 ** tokenDecimals))
    try {
      await redeem(sharesBigInt)
      toast.success('Redemption successful')
      setRedeemShares('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleClaimForSyndicate = async () => {
    try {
      await claimFeesForSyndicate()
      toast.success('Creator fees claimed and distributed to pool')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleClaimForSelf = async () => {
    try {
      await claimFeesForSelf()
      toast.success('Fees claimed')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleJoinRequest = async () => {
    try {
      await requestToJoin(joinMessage)
      toast.success('Join request sent to syndicate owner')
      setJoinSent(true)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const canDeposit = !whitelistEnabled || isWhitelisted
  const showJoinRequest = whitelistEnabled && !isWhitelisted && !joinSent

  return (
    <div className="flex flex-col gap-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
        <Users className="h-4 w-4 text-[var(--color-gold-primary)]" />
        Member Actions
      </h3>

      {/* Request to Join */}
      {showJoinRequest && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <LogIn className="h-4 w-4 text-yellow-500" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Request to Join
            </p>
          </div>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">
            This syndicate requires approval. Send a request to the owner.
          </p>
          <textarea
            value={joinMessage}
            onChange={e => setJoinMessage(e.target.value)}
            rows={2}
            maxLength={280}
            placeholder="Introduce yourself... (optional)"
            className="font-body mb-2 w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs focus:border-[var(--color-gold-primary)] focus:outline-none"
          />
          <button
            onClick={handleJoinRequest}
            disabled={loading === 'joinRequest'}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
          >
            {loading === 'joinRequest' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send Request
          </button>
        </div>
      )}

      {joinSent && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-center text-sm text-green-400">
          Join request sent. The owner will review your request.
        </div>
      )}

      {/* Deposit */}
      {canDeposit && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <p className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
            Deposit {tokenSymbol}
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder={`Amount (${tokenSymbol})`}
              className="font-body flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            <button
              onClick={handleDeposit}
              disabled={loading === 'deposit' || !depositAmount}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] px-4 text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
            >
              {loading === 'deposit' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Deposit
            </button>
          </div>
        </div>
      )}

      {/* Redeem */}
      {shares !== undefined && shares > 0n && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Redeem Shares</p>
            <span className="text-xs text-[var(--color-text-muted)]">
              Your shares:{' '}
              {isLoadingMember ? (
                <Skeleton className="inline-block h-3 w-12" />
              ) : (
                <span className="font-medium text-[var(--color-text-primary)]">
                  {parseFloat(formattedShares ?? '0').toFixed(4)}
                </span>
              )}
            </span>
          </div>
          {formattedIdlePrincipal && (
            <p className="mb-3 text-xs text-[var(--color-text-muted)]">
              Idle funds available:{' '}
              <span className="font-medium text-[var(--color-text-primary)]">
                {parseFloat(formattedIdlePrincipal).toFixed(4)} {tokenSymbol}
              </span>
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              value={redeemShares}
              onChange={e => setRedeemShares(e.target.value)}
              placeholder="Shares to redeem"
              max={formattedShares ?? undefined}
              className="font-body flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            {formattedShares && (
              <button
                type="button"
                onClick={() => setRedeemShares(formattedShares)}
                className="px-3 text-xs font-medium text-[var(--color-gold-primary)] hover:text-[var(--color-gold-light)]"
              >
                MAX
              </button>
            )}
            <button
              onClick={handleRedeem}
              disabled={loading === 'redeem' || !redeemShares}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold-primary)] disabled:opacity-50"
            >
              {loading === 'redeem' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Redeem
            </button>
          </div>
        </div>
      )}

      {/* Claim Fees for Syndicate */}
      {hasAgent && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <div className="mb-1 flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--color-gold-primary)]" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Claim Fees for Syndicate
            </p>
          </div>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">
            Pulls creator fees from the sentinel and distributes them to all share holders. Anyone
            can call this.
          </p>
          <button
            onClick={handleClaimForSyndicate}
            disabled={loading === 'claimForSyndicate'}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
          >
            {loading === 'claimForSyndicate' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Claim & Distribute
          </button>
        </div>
      )}

      {/* Claim Fees for Self */}
      {pendingFees !== undefined && pendingFees > 0n && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-[var(--color-gold-primary)]" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                Claim Your Fees
              </p>
            </div>
            <span className="text-xs font-medium text-[var(--color-gold-primary)]">
              {parseFloat(formattedPendingFees ?? '0').toFixed(6)} {tokenSymbol}
            </span>
          </div>
          <button
            onClick={handleClaimForSelf}
            disabled={loading === 'claimSelf'}
            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
          >
            {loading === 'claimSelf' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Claim {parseFloat(formattedPendingFees ?? '0').toFixed(4)} {tokenSymbol}
          </button>
        </div>
      )}
    </div>
  )
}
