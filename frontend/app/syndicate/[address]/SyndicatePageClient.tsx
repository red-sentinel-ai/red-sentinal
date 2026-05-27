'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Eye,
  Wallet,
  LogOut,
  Coins,
  Award,
  Terminal,
  User,
  Globe,
  Share2,
  Loader2,
} from 'lucide-react'
import {
  SyndicateMembersTable,
  type SyndicateMemberDetail,
} from '@/components/syndicate/SyndicateMembersTable'
import { toast } from 'sonner'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import { formatTokenAmount } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useSyndicateMemberInfo,
  useSyndicateWithdrawalUnlock,
} from '@/hooks/syndicate/useSyndicateInfo'
import { useSyndicateOwnerActions } from '@/hooks/syndicate/useSyndicateOwnerActions'
import { useSyndicateMemberActions } from '@/hooks/syndicate/useSyndicateMemberActions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface BackendSyndicate {
  contract_address: string
  owner: string
  name: string
  syndicate_path: string | null
  description: string
  social_link: string | null
  token_address: string
  token_symbol: string
  whitelist_enabled: boolean
  agent_id: string | null
  agent_path: string | null
  // Decimal128 strings (wei). Render with formatUnits + tokenDecimals.
  total_funds: string
  total_shares: string
  total_deposits_count: number
  total_redemptions_count: number
  agent_initial_fund: string
  agent_total_funded: string
  agent_total_withdrawn: string
  creator_fees_claimed_total: string
  contributor_fees_claimed_total: string
  members: string[]
  members_count: number
  members_detailed?: SyndicateMemberDetail[]
  network: string
  created_at: string
  updated_at: string
}

interface SyndicatePageClientProps {
  /** Either a contract address (0x…) or a syndicate slug. The backend resolves both. */
  identifier: string
}

export default function SyndicatePageClient({ identifier }: SyndicatePageClientProps) {
  const { address: connectedAddress } = useAccount()

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [whitelistInput, setWhitelistInput] = useState('')

  // Off-chain metadata — backend GET /syndicates/:identifier accepts either
  // a contract address or a slug. We then use the doc's contract_address for
  // anything that needs a real EVM address (RPC reads, owner action hooks).
  const { data: metaData, refetch: refetchMeta } = useQuery<{ syndicate: BackendSyndicate }>({
    queryKey: ['syndicate-meta', identifier],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicates/${identifier}?network=${APP_NETWORK}`
      )
      if (!res.ok) throw new Error('Syndicate not found')
      return res.json()
    },
  })

  const meta = metaData?.syndicate
  // Only set once meta resolves — RPC hooks must not run with a slug.
  const address = meta?.contract_address as `0x${string}` | undefined

  // Syndicate-level state now comes entirely from the backend doc — the
  // webhook pipeline keeps it in sync with on-chain events, so no RPC needed.
  const agentId = meta?.agent_id ?? undefined
  const whitelistEnabled = meta?.whitelist_enabled
  const tokenAddress = meta?.token_address as `0x${string}` | undefined
  const isContractLoading = !meta

  // Per-wallet state stays on RPC — it's keyed by the connected wallet
  // and isn't worth caching server-side.
  const {
    shares,
    pendingFees,
    isWhitelisted,
    isLoading: isMemberLoading,
  } = useSyndicateMemberInfo(address, connectedAddress)

  const { isLocked } = useSyndicateWithdrawalUnlock(agentId)

  // Action hooks just store the address until an action fires. Buttons are
  // disabled until meta resolves so the placeholder is never actually used.
  const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as `0x${string}`
  const safeAddress: `0x${string}` = address ?? ZERO_ADDR

  // Actions
  const {
    fundAgent,
    withdrawFromSentinel,
    setWhitelistEnabled: toggleWhitelist,
    whitelistAddresses,
    loading: ownerLoading,
  } = useSyndicateOwnerActions(safeAddress)

  const {
    deposit,
    redeem,
    claimFeesForSyndicate,
    claimFeesForSelf,
    loading: memberLoading,
  } = useSyndicateMemberActions(safeAddress)

  const tokenDecimals = meta ? getDecimalsForSymbol(meta.token_symbol) : 18
  // const isOwner =
  //   connectedAddress && owner && connectedAddress.toLowerCase() === owner.toLowerCase()

  // Derive headline metrics from the denormalised syndicate doc.
  // total_funds is net contributor capital (deposits - redemptions).
  // active_in_sentinel is what's currently deployed into the agent.
  const formattedTVL = meta ? formatTokenAmount(meta.total_funds, tokenDecimals) : null

  // idlePrincipal mirrors the contract math:
  //   token.balanceOf(syndicate) - reservedFeeBalance
  //   = deposits - redemptions - initialFund - agent_funded + agent_withdrawn
  //   = total_funds - (agent_initial_fund + agent_total_funded - agent_total_withdrawn)
  // The registerAgent path moves `initialFund` straight from the vault to the
  // sentinel via safeTransferFrom — it's NOT counted in agent_total_funded
  // (that only tracks AgentFundedThroughSyndicate events), so it must be
  // deducted separately. Fee in/out cancels: creator fees enter both balance
  // and reserve, contributor claims exit equally — see SentinelSyndicate.sol.
  const idlePrincipalWei = meta
    ? (
        BigInt(meta.total_funds) -
        (BigInt(meta.agent_initial_fund) +
          BigInt(meta.agent_total_funded) -
          BigInt(meta.agent_total_withdrawn))
      ).toString()
    : undefined
  const formattedIdle = idlePrincipalWei
    ? formatTokenAmount(idlePrincipalWei, tokenDecimals)
    : null

  const formattedPendingFees =
    pendingFees !== undefined ? formatTokenAmount(pendingFees, tokenDecimals) : null

  const formattedShares =
    shares !== undefined ? formatUnits(shares, tokenDecimals) : null

  const refresh = () => refetchMeta()

  const closeModal = () => {
    setActiveModal(null)
    setInputValue('')
    setWhitelistInput('')
  }

  // Owner action handlers
  const handleFundAgent = async () => {
    if (!inputValue || !tokenAddress) return
    try {
      // Funds come from the syndicate's idle balance, not the caller's wallet.
      // Pre-check so the user gets a readable error instead of an on-chain
      // InsufficientLiquidity revert (which surfaces as a gas-cap error).
      const amountWei = BigInt(Math.floor(parseFloat(inputValue) * 10 ** tokenDecimals))
      const idleWei = idlePrincipalWei ? BigInt(idlePrincipalWei) : 0n
      if (amountWei > idleWei) {
        toast.error(
          `Insufficient idle funds in the syndicate. Available: ${formattedIdle ?? '0.00'} ${meta?.token_symbol ?? ''}`
        )
        return
      }
      await fundAgent(tokenAddress, inputValue, tokenDecimals)
      toast.success('Sentinel funded successfully')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleWithdraw = async () => {
    if (!inputValue) return
    try {
      await withdrawFromSentinel(inputValue, tokenDecimals)
      toast.success('Withdrawn to syndicate')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleToggleVisibility = async () => {
    try {
      await toggleWhitelist(!whitelistEnabled)
      toast.success(whitelistEnabled ? 'Syndicate is now public' : 'Syndicate is now permissioned')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleWhitelistAdd = async () => {
    const addrs = parseAddresses(whitelistInput)
    if (addrs.length === 0) {
      toast.error('No valid addresses')
      return
    }
    if (addrs.length > 10) {
      toast.error('Max 10 addresses per transaction')
      return
    }
    try {
      await whitelistAddresses(addrs, true)
      toast.success(`${addrs.length} address(es) whitelisted`)
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  // Member action handlers
  const handleDeposit = async () => {
    if (!inputValue || !tokenAddress) return
    try {
      await deposit(tokenAddress, inputValue, tokenDecimals)
      toast.success('Deposit successful')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleRedeem = async () => {
    if (!inputValue) return
    const sharesBigInt = BigInt(Math.floor(parseFloat(inputValue) * 10 ** tokenDecimals))
    try {
      await redeem(sharesBigInt)
      toast.success('Redemption successful')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleClaimPersonalFees = async () => {
    try {
      await claimFeesForSelf()
      toast.success('Fees claimed')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleClaimCreatorRewards = async () => {
    try {
      await claimFeesForSyndicate()
      toast.success('Creator fees claimed and distributed')
      closeModal()
      refresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const canDeposit = !whitelistEnabled || isWhitelisted

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-20">
      <div className="mx-auto max-w-6xl px-6 pt-12 lg:px-12">
        {/* Section 1: Syndicate Overview Header */}
        <section className="mb-20 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-4">
            {!meta ? (
              <>
                <Skeleton className="h-16 w-80" />
                <Skeleton className="h-6 w-96" />
              </>
            ) : (
              <>
                <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-[var(--color-text-primary)] md:text-6xl lg:text-7xl">
                  {meta.name}
                </h1>
                {meta.description && (
                  <p className="max-w-xl text-base text-[var(--color-text-muted)]">
                    {meta.description}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  {meta.social_link && (
                    <a
                      href={meta.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-widest">Website</span>
                    </a>
                  )}
                  <button className="flex items-center gap-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-widest">Share</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="pb-1">
            {agentId ? (
              <Link
                href={meta?.agent_path ?? `/agent/${agentId}`}
                className="button-ghost-terminal inline-flex items-center gap-2 px-6 py-3"
              >
                View Sentinel
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                No Sentinel
              </span>
            )}
          </div>
        </section>

        {/* Section 2: Core Financial Metrics */}
        <section className="mb-20 grid grid-cols-1 divide-y divide-[var(--color-border-strong)] border border-[var(--color-border-strong)] md:grid-cols-3 md:divide-x md:divide-y-0">
          <MetricCard
            label="Total Managed Assets"
            value={isContractLoading ? null : `$${formattedTVL ?? '0.00'}`}
            subtitle={`+0.0% (24H)`}
            subtitleClass="text-[var(--color-text-primary)]"
          />
          <MetricCard
            label="Idle Principal"
            value={isContractLoading ? null : `$${formattedIdle ?? '0.00'}`}
            subtitle="Not yet in sentinel"
            subtitleClass="text-[var(--color-text-muted)]"
          />
          <MetricCard
            label="Pending User Fees"
            value={isMemberLoading ? null : `$${formattedPendingFees ?? '0.00'}`}
            subtitle="Unclaimed yield"
            subtitleClass="text-[var(--color-text-muted)]"
          />
        </section>

        {/* Section 3: Management Command Center */}
        <section className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-[var(--color-text-primary)]" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                Syndicate Owner Controls
              </h3>
              <span className="bg-[var(--color-text-muted)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Restricted
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <ControlItem
                title="Add Funds to Sentinel"
                subtitle="Syndicate Idle -> Sentinel Active"
                icon={<ArrowRight className="h-5 w-5" />}
                onClick={() => setActiveModal('fundSentinel')}
                disabled={!agentId}
              />
              <ControlItem
                title="Withdraw Funds from Sentinel"
                subtitle="Move liquidity to Idle Funds"
                icon={<ArrowLeft className="h-5 w-5" />}
                onClick={() => setActiveModal('withdrawSentinel')}
                disabled={!agentId || isLocked}
              />
              <ControlItem
                title="Whitelist Operators"
                subtitle="Manage member permissions"
                icon={<Users className="h-5 w-5" />}
                onClick={() => setActiveModal('whitelist')}
              />
              <ControlItem
                title="Change Syndicate Visibility"
                subtitle={`Current: ${whitelistEnabled ? 'PERMISSIONED' : 'PUBLIC'}`}
                icon={<Eye className="h-5 w-5" />}
                onClick={() => setActiveModal('visibility')}
              />
            </div>
          </div>
          {/* Member Portal */}
          {connectedAddress && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[var(--color-text-primary)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                  Member Portal
                </h3>
                {shares !== undefined && shares > 0n ? (
                  <span className="bg-[var(--color-text-primary)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-primary)]">
                    Member Active
                  </span>
                ) : (
                  <span className="bg-[var(--color-text-muted)]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    Not a Member
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MemberActionCard
                  title="Deposit Principal"
                  icon={<Wallet className="h-6 w-6" />}
                  onClick={() => setActiveModal('deposit')}
                  disabled={!canDeposit}
                />
                <MemberActionCard
                  title="Redeem Shares"
                  icon={<LogOut className="h-6 w-6" />}
                  onClick={() => setActiveModal('redeem')}
                  disabled={!shares || shares === 0n}
                />
                <MemberActionCard
                  title="Claim Personal Fees"
                  icon={<Coins className="h-6 w-6" />}
                  onClick={() => setActiveModal('claimFees')}
                  disabled={!pendingFees || pendingFees === 0n}
                />
                <MemberActionCard
                  title="Creator Rewards"
                  icon={<Award className="h-6 w-6" />}
                  onClick={() => setActiveModal('creatorRewards')}
                  disabled={!agentId}
                />
              </div>
            </div>
          )}

          {!connectedAddress && (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 border border-[var(--color-border-default)] py-16">
              <Wallet className="h-12 w-12 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">
                Connect your wallet to interact with this syndicate
              </p>
            </div>
          )}
        </section>

        {/* Section 4: Members List */}
        {meta && (
          <SyndicateMembersTable
            members={
              meta.members_detailed ??
              meta.members.map(addr => buildFallbackMember(addr, meta.owner))
            }
            tokenSymbol={meta.token_symbol}
            tokenDecimals={tokenDecimals}
          />
        )}
      </div>

      {/* Modals */}
      {/* Fund Sentinel Modal */}
      <Dialog open={activeModal === 'fundSentinel'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Sentinel</DialogTitle>
            <DialogDescription>
              Deploys idle syndicate capital into the active sentinel. Does not pull from your
              wallet, only funds already deposited into the syndicate are available.
              <span className="mt-1 block text-[var(--color-text-primary)]">
                Idle available: {formattedIdle ?? '0.00'} {meta?.token_symbol ?? ''}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Amount (${meta?.token_symbol ?? 'TOKEN'})`}
              className="w-full border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            <button
              onClick={handleFundAgent}
              disabled={ownerLoading === 'fundAgent' || !inputValue}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ownerLoading === 'fundAgent' && <Loader2 className="h-4 w-4 animate-spin" />}
              Fund Sentinel
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw from Sentinel Modal */}
      <Dialog
        open={activeModal === 'withdrawSentinel'}
        onOpenChange={open => !open && closeModal()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw from Sentinel</DialogTitle>
            <DialogDescription>
              Move liquidity from the active sentinel back to syndicate idle funds.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Amount (${meta?.token_symbol ?? 'TOKEN'})`}
              className="w-full border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            <button
              onClick={handleWithdraw}
              disabled={ownerLoading === 'withdraw' || !inputValue}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ownerLoading === 'withdraw' && <Loader2 className="h-4 w-4 animate-spin" />}
              Withdraw
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Whitelist Modal */}
      <Dialog open={activeModal === 'whitelist'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Whitelist Operators</DialogTitle>
            <DialogDescription>
              Add addresses to the syndicate whitelist (max 10 per transaction).
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <textarea
              value={whitelistInput}
              onChange={e => setWhitelistInput(e.target.value)}
              rows={4}
              placeholder="0x1234...&#10;0x5678..."
              className="w-full resize-none border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            <button
              onClick={handleWhitelistAdd}
              disabled={ownerLoading === 'whitelistAddrs' || !whitelistInput.trim()}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ownerLoading === 'whitelistAddrs' && <Loader2 className="h-4 w-4 animate-spin" />}
              Whitelist Addresses
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility Modal */}
      <Dialog open={activeModal === 'visibility'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Syndicate Visibility</DialogTitle>
            <DialogDescription>
              {whitelistEnabled
                ? 'The syndicate is currently permissioned. Only whitelisted addresses can deposit.'
                : 'The syndicate is currently public. Anyone can deposit.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={handleToggleVisibility}
              disabled={ownerLoading === 'whitelist'}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {ownerLoading === 'whitelist' && <Loader2 className="h-4 w-4 animate-spin" />}
              {whitelistEnabled ? 'Make Public' : 'Make Permissioned'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={activeModal === 'deposit'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Principal</DialogTitle>
            <DialogDescription>
              Deposit {meta?.token_symbol ?? 'tokens'} to receive syndicate shares.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={`Amount (${meta?.token_symbol ?? 'TOKEN'})`}
              className="w-full border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
            />
            <button
              onClick={handleDeposit}
              disabled={memberLoading === 'deposit' || !inputValue}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {memberLoading === 'deposit' && <Loader2 className="h-4 w-4 animate-spin" />}
              Deposit
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Modal */}
      <Dialog open={activeModal === 'redeem'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Shares</DialogTitle>
            <DialogDescription>
              Redeem your syndicate shares for {meta?.token_symbol ?? 'tokens'}.
              {formattedShares && (
                <span className="mt-1 block text-[var(--color-text-primary)]">
                  Your shares: {parseFloat(formattedShares).toFixed(4)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Shares to redeem"
                className="flex-1 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-text-primary)] focus:outline-none"
              />
              {formattedShares && (
                <button
                  type="button"
                  onClick={() => setInputValue(formattedShares)}
                  className="px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] transition-opacity hover:opacity-70"
                >
                  Max
                </button>
              )}
            </div>
            <button
              onClick={handleRedeem}
              disabled={memberLoading === 'redeem' || !inputValue}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {memberLoading === 'redeem' && <Loader2 className="h-4 w-4 animate-spin" />}
              Redeem
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Personal Fees Modal */}
      <Dialog open={activeModal === 'claimFees'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Personal Fees</DialogTitle>
            <DialogDescription>
              You have{' '}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {formattedPendingFees ?? '0.00'} {meta?.token_symbol ?? ''}
              </span>{' '}
              in pending fees to claim.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={handleClaimPersonalFees}
              disabled={memberLoading === 'claimSelf'}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {memberLoading === 'claimSelf' && <Loader2 className="h-4 w-4 animate-spin" />}
              Claim Fees
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Creator Rewards Modal */}
      <Dialog open={activeModal === 'creatorRewards'} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Creator Rewards</DialogTitle>
            <DialogDescription>
              Pull creator fees from the sentinel and distribute them to all shareholders. Anyone
              can call this function.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={handleClaimCreatorRewards}
              disabled={memberLoading === 'claimForSyndicate'}
              className="flex h-11 w-full items-center justify-center gap-2 bg-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wider text-[var(--color-bg-deepest)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {memberLoading === 'claimForSyndicate' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Claim & Distribute
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sub-components

function MetricCard({
  label,
  value,
  subtitle,
  subtitleClass,
}: {
  label: string
  value: string | null
  subtitle: string
  subtitleClass?: string
}) {
  return (
    <div className="p-6 transition-colors hover:bg-white/[0.02]">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      {value === null ? (
        <Skeleton className="mb-1 h-10 w-40" />
      ) : (
        <p className="font-display text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
          {value}
        </p>
      )}
      <p className={`mt-1 text-xs uppercase ${subtitleClass ?? 'text-[var(--color-text-muted)]'}`}>
        {subtitle}
      </p>
    </div>
  )
}

function ControlItem({
  title,
  subtitle,
  icon,
  onClick,
  disabled,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-between border border-[var(--color-border-strong)] p-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div>
        <p className="text-sm font-medium uppercase text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
      <span className="text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {icon}
      </span>
    </button>
  )
}

function MemberActionCard({
  title,
  icon,
  onClick,
  disabled,
}: {
  title: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group border border-[var(--color-border-strong)] p-5 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="mb-4 block text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text-primary)]">
        {icon}
      </span>
      <p className="text-sm font-medium uppercase text-[var(--color-text-primary)]">{title}</p>
    </button>
  )
}

function getDecimalsForSymbol(symbol: string): number {
  const map: Record<string, number> = { USDC: 18, USDT: 18, WBNB: 18, BNB: 18 }
  return map[symbol] ?? 18
}

function buildFallbackMember(address: string, owner: string): SyndicateMemberDetail {
  const isOwner = address.toLowerCase() === owner.toLowerCase()
  return {
    address: address.toLowerCase(),
    is_owner: isOwner,
    designation: isOwner ? 'SYNDICATE_OWNER' : 'MEMBER',
    shares: '0',
    deposited: '0',
    redeemed: '0',
    net_deposited: '0',
    fees_claimed: '0',
    deposits_count: 0,
    redemptions_count: 0,
    equity_share: 0,
    first_deposit_at: null,
    last_activity_at: null,
    username: null,
    avatar_url: null,
    twitter_username: null,
    twitter_avatar: null,
    discord_username: null,
    discord_avatar: null,
  }
}

function parseAddresses(input: string): `0x${string}`[] {
  return input
    .split(/[\n,]+/)
    .map(a => a.trim())
    .filter(a => a.startsWith('0x') && a.length === 42) as `0x${string}`[]
}
