'use client'

import { useState } from 'react'
import { Loader2, Shield, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSyndicateOwnerActions } from '@/hooks/syndicate/useSyndicateOwnerActions'
import { useSyndicateWithdrawalUnlock } from '@/hooks/syndicate/useSyndicateInfo'

interface OwnerPanelProps {
  syndicateAddress: `0x${string}`
  tokenAddress: `0x${string}`
  tokenSymbol: string
  tokenDecimals: number
  whitelistEnabled: boolean
  agentId: string | undefined
  onRefresh: () => void
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  const mins = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${mins}m`
}

export function OwnerPanel({
  syndicateAddress,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  whitelistEnabled,
  agentId,
  onRefresh,
}: OwnerPanelProps) {
  const { fundAgent, withdrawFromSentinel, setWhitelistEnabled, whitelistAddresses, loading } =
    useSyndicateOwnerActions(syndicateAddress)

  const { isLocked, lockRemaining } = useSyndicateWithdrawalUnlock(agentId)

  const [fundAmount, setFundAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [whitelistInput, setWhitelistInput] = useState('')
  const [removeWhitelistInput, setRemoveWhitelistInput] = useState('')

  const parseAddresses = (input: string): `0x${string}`[] =>
    input
      .split(/[\n,]+/)
      .map(a => a.trim())
      .filter(a => a.startsWith('0x') && a.length === 42) as `0x${string}`[]

  const handleFundAgent = async () => {
    if (!fundAmount) return
    try {
      await fundAgent(tokenAddress, fundAmount, tokenDecimals)
      toast.success('Sentinel funded')
      setFundAmount('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    try {
      await withdrawFromSentinel(withdrawAmount, tokenDecimals)
      toast.success('Withdrawn to syndicate')
      setWithdrawAmount('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleToggleWhitelist = async () => {
    try {
      await setWhitelistEnabled(!whitelistEnabled)
      toast.success(whitelistEnabled ? 'Whitelist disabled' : 'Whitelist enabled')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleWhitelistAdd = async () => {
    const addrs = parseAddresses(whitelistInput)
    if (addrs.length === 0) { toast.error('No valid addresses'); return }
    if (addrs.length > 10) { toast.error('Max 10 addresses per transaction'); return }
    try {
      await whitelistAddresses(addrs, true)
      toast.success(`${addrs.length} address(es) whitelisted`)
      setWhitelistInput('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleWhitelistRemove = async () => {
    const addrs = parseAddresses(removeWhitelistInput)
    if (addrs.length === 0) { toast.error('No valid addresses'); return }
    if (addrs.length > 10) { toast.error('Max 10 addresses per transaction'); return }
    try {
      await whitelistAddresses(addrs, false)
      toast.success(`${addrs.length} address(es) removed`)
      setRemoveWhitelistInput('')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
        <Shield className="h-4 w-4 text-[var(--color-gold-primary)]" />
        Owner Controls
      </h3>

      {/* Fund Sentinel */}
      {agentId && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <p className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
            Fund Sentinel
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
              placeholder={`Amount (${tokenSymbol})`}
              className="font-body flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            <button
              onClick={handleFundAgent}
              disabled={loading === 'fundAgent' || !fundAmount}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] px-4 text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
            >
              {loading === 'fundAgent' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Fund
            </button>
          </div>
        </div>
      )}

      {/* Withdraw from Sentinel */}
      {agentId && (
        <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Withdraw from Bounty Pool
            </p>
            {isLocked && lockRemaining > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                <AlertCircle className="h-3 w-3" />
                Locked {formatDuration(lockRemaining)}
              </span>
            )}
          </div>
          {isLocked && (
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">
              Withdrawal is locked for 14 days after the last fund operation.
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder={`Amount (${tokenSymbol})`}
              disabled={isLocked}
              className="font-body flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm focus:border-[var(--color-gold-primary)] focus:outline-none disabled:opacity-40"
            />
            <button
              onClick={handleWithdraw}
              disabled={loading === 'withdraw' || !withdrawAmount || isLocked}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-4 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold-primary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
            >
              {loading === 'withdraw' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Withdraw
            </button>
          </div>
        </div>
      )}

      {/* Whitelist toggle */}
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Member Whitelist
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {whitelistEnabled ? 'Only approved addresses can deposit' : 'Anyone can deposit'}
            </p>
          </div>
          <button
            onClick={handleToggleWhitelist}
            disabled={loading === 'whitelist'}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold-primary)] disabled:opacity-50"
          >
            {loading === 'whitelist' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : whitelistEnabled ? (
              <ToggleRight className="h-4 w-4 text-[var(--color-gold-primary)]" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {whitelistEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Whitelist addresses */}
      {whitelistEnabled && (
        <>
          <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
            <p className="mb-1 text-sm font-medium text-[var(--color-text-secondary)]">
              Add to Whitelist
            </p>
            <p className="mb-3 text-xs text-[var(--color-text-muted)]">
              Up to 10 addresses per transaction (one per line or comma-separated).
            </p>
            <textarea
              value={whitelistInput}
              onChange={e => setWhitelistInput(e.target.value)}
              rows={3}
              placeholder="0x1234...&#10;0x5678..."
              className="font-body mb-2 w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            <button
              onClick={handleWhitelistAdd}
              disabled={loading === 'whitelistAddrs' || !whitelistInput.trim()}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] text-sm font-medium text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)] disabled:opacity-50"
            >
              {loading === 'whitelistAddrs' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Whitelist Addresses
            </button>
          </div>

          <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
            <p className="mb-1 text-sm font-medium text-[var(--color-text-secondary)]">
              Remove from Whitelist
            </p>
            <textarea
              value={removeWhitelistInput}
              onChange={e => setRemoveWhitelistInput(e.target.value)}
              rows={3}
              placeholder="0x1234...&#10;0x5678..."
              className="font-body mb-2 w-full resize-none rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs focus:border-[var(--color-gold-primary)] focus:outline-none"
            />
            <button
              onClick={handleWhitelistRemove}
              disabled={loading === 'whitelistAddrs' || !removeWhitelistInput.trim()}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold-primary)] disabled:opacity-50"
            >
              {loading === 'whitelistAddrs' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Remove Addresses
            </button>
          </div>
        </>
      )}
    </div>
  )
}
