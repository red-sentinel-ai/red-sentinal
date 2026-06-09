'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'
import { SUI_SENTINEL_API_URL } from '@/constants'
import { APP_NETWORK } from '@/constants/shared'
import { formatTokenAmount } from '@/lib/utils'
import { useSyndicatePendingFees } from '@/hooks/syndicate/useSyndicateInfo'
import { useSyndicateOwnerActions } from '@/hooks/syndicate/useSyndicateOwnerActions'
import { useSyndicateMemberActions } from '@/hooks/syndicate/useSyndicateMemberActions'
import { useEVMBalance } from '@/hooks/useEVMBalance'
import type { BackendSyndicate, SyndicateModalId } from '@/types/Syndicate'
import {
  buildFallbackMember,
  getDecimalsForSymbol,
  getMaxRedeemableSharesWei,
  parseAddresses,
} from '@/lib/syndicate-utils'
import { SyndicateHero } from '@/components/syndicate/SyndicateHero'
import { SyndicateMetricsGrid } from '@/components/syndicate/SyndicateMetricsGrid'
import { SyndicateOwnerControls } from '@/components/syndicate/SyndicateOwnerControls'
import { SyndicateMemberPortal } from '@/components/syndicate/SyndicateMemberPortal'
import { SyndicateMembersTable } from '@/components/syndicate/SyndicateMembersTable'
import { FundSentinelModal } from '@/components/syndicate/modals/FundSentinelModal'
import { WithdrawSentinelModal } from '@/components/syndicate/modals/WithdrawSentinelModal'
import { WhitelistModal } from '@/components/syndicate/modals/WhitelistModal'
import { VisibilityModal } from '@/components/syndicate/modals/VisibilityModal'
import { DepositModal } from '@/components/syndicate/modals/DepositModal'
import { RedeemModal } from '@/components/syndicate/modals/RedeemModal'
import { ClaimPersonalFeesModal } from '@/components/syndicate/modals/ClaimPersonalFeesModal'
import { CreatorRewardsModal } from '@/components/syndicate/modals/CreatorRewardsModal'

interface Props {
  /** Either a contract address (0x…) or a syndicate slug. The backend resolves both. */
  identifier: string
}

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as `0x${string}`

export default function SyndicatePageClient({ identifier }: Props) {
  const { address: connectedAddress } = useAccount()

  const [activeModal, setActiveModal] = useState<SyndicateModalId | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [whitelistInput, setWhitelistInput] = useState('')

  const closeModal = () => {
    setActiveModal(null)
    setInputValue('')
    setWhitelistInput('')
  }

  // Backend doc — GET /syndicates/:identifier accepts contract address OR slug.
  const { data: metaData, refetch: refetchMeta } = useQuery<{ syndicate: BackendSyndicate }>({
    queryKey: ['syndicate-meta', identifier],
    queryFn: async () => {
      const res = await fetch(
        `${SUI_SENTINEL_API_URL}/syndicates/${identifier}?network=${APP_NETWORK}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Syndicate not found')
      return res.json()
    },
  })

  const meta = metaData?.syndicate
  const address = meta?.contract_address as `0x${string}` | undefined
  const tokenAddress = meta?.token_address as `0x${string}` | undefined
  const agentId = meta?.agent_id ?? undefined
  const whitelistEnabled = meta?.whitelist_enabled
  const tokenSymbol = meta?.token_symbol ?? 'TOKEN'
  const tokenDecimals = meta ? getDecimalsForSymbol(meta.token_symbol) : 18

  const { pendingFees, refetch: refetchPendingFees } = useSyndicatePendingFees(
    address,
    connectedAddress
  )

  const connectedLower = connectedAddress?.toLowerCase()
  const myMember = connectedLower
    ? meta?.members_detailed?.find(m => m.address === connectedLower)
    : undefined
  const shares = myMember ? BigInt(myMember.shares) : undefined
  const isWhitelisted = connectedLower ? meta?.members?.includes(connectedLower) : undefined
  const isMemberLoading = !meta

  const unlockTimestamp = meta?.agent_unlock_timestamp
    ? Number(meta.agent_unlock_timestamp)
    : null
  const isLocked = unlockTimestamp !== null && Date.now() < unlockTimestamp

  // Buttons stay disabled until meta resolves; the placeholder is never used.
  const safeAddress: `0x${string}` = address ?? ZERO_ADDR
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

  const { balance: walletTokenBalance } = useEVMBalance(tokenAddress)
  const formattedWalletBalance =
    walletTokenBalance !== null
      ? walletTokenBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : null

  // Derived display values.
  const formattedTVL = meta ? formatTokenAmount(meta.total_funds, tokenDecimals) : null
  // idlePrincipal mirrors the contract:
  //   total_funds - (agent_initial_fund + agent_total_funded - agent_total_withdrawn)
  // initialFund is moved straight to the sentinel via safeTransferFrom and is NOT
  // counted in agent_total_funded — see SentinelSyndicate.sol.
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

  const unclaimedCreatorFeesWei = meta?.agent_unclaimed_creator_fees
    ? BigInt(meta.agent_unclaimed_creator_fees)
    : undefined
  const formattedUnclaimedCreatorFees =
    unclaimedCreatorFeesWei !== undefined
      ? formatTokenAmount(unclaimedCreatorFeesWei.toString(), tokenDecimals)
      : null
  const hasUnclaimedCreatorFees =
    unclaimedCreatorFeesWei !== undefined && unclaimedCreatorFeesWei > 0n

  // Shares redeem only against idle syndicate funds, not capital locked in the
  // sentinel — see getMaxRedeemableSharesWei. total_funds === totalManagedAssets.
  const maxRedeemableSharesWei = getMaxRedeemableSharesWei({
    shares,
    totalShares: meta ? BigInt(meta.total_shares) : undefined,
    totalManagedAssets: meta ? BigInt(meta.total_funds) : undefined,
    idlePrincipal: idlePrincipalWei !== undefined ? BigInt(idlePrincipalWei) : undefined,
  })
  const formattedMaxRedeemable =
    maxRedeemableSharesWei !== undefined
      ? formatUnits(maxRedeemableSharesWei, tokenDecimals)
      : null

  const refresh = () => {
    refetchMeta()
    refetchPendingFees()
  }
  const openModal = (id: SyndicateModalId) => setActiveModal(id)

  // Handlers — all share the same try/catch/toast/refresh shape.
  async function runAction(fn: () => Promise<unknown>, successMsg: string) {
    try {
      await fn()
      toast.success(successMsg)
      closeModal()
      refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed')
    }
  }

  async function handleFundAgent() {
    if (!inputValue || !tokenAddress) return
    // Pre-check idle balance so the user gets a readable error instead of an
    // on-chain InsufficientLiquidity revert (surfaces as a gas-cap error).
    const amountWei = BigInt(Math.floor(parseFloat(inputValue) * 10 ** tokenDecimals))
    const idleWei = idlePrincipalWei ? BigInt(idlePrincipalWei) : 0n
    if (amountWei > idleWei) {
      toast.error(
        `Insufficient idle funds in the syndicate. Available: ${formattedIdle ?? '0.00'} ${tokenSymbol}`
      )
      return
    }
    await runAction(
      () => fundAgent(tokenAddress, inputValue, tokenDecimals),
      'Sentinel funded successfully'
    )
  }

  async function handleWithdraw() {
    if (!inputValue) return
    if (isLocked) {
      toast.error('Withdrawal is locked for 14 days after the sentinel was last funded')
      return
    }
    await runAction(
      () => withdrawFromSentinel(inputValue, tokenDecimals),
      'Withdrawn to syndicate'
    )
  }

  async function handleToggleVisibility() {
    await runAction(
      () => toggleWhitelist(!whitelistEnabled),
      whitelistEnabled ? 'Syndicate is now public' : 'Syndicate is now permissioned'
    )
  }

  async function handleWhitelistAdd() {
    const addrs = parseAddresses(whitelistInput)
    if (addrs.length === 0) {
      toast.error('No valid addresses')
      return
    }
    if (addrs.length > 10) {
      toast.error('Max 10 addresses per transaction')
      return
    }
    await runAction(
      () => whitelistAddresses(addrs, true),
      `${addrs.length} address(es) whitelisted`
    )
  }

  async function handleDeposit() {
    if (!inputValue || !tokenAddress) return
    const amount = parseFloat(inputValue)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    if (walletTokenBalance !== null && amount > walletTokenBalance) {
      toast.error(
        `Insufficient ${tokenSymbol} balance. You have ${formattedWalletBalance ?? '0'} ${tokenSymbol}`
      )
      return
    }
    await runAction(
      () => deposit(tokenAddress, inputValue, tokenDecimals),
      'Deposit successful'
    )
  }

  async function handleRedeem() {
    if (!inputValue) return
    const sharesBigInt = BigInt(Math.floor(parseFloat(inputValue) * 10 ** tokenDecimals))
    // Pre-check liquidity so the user gets a readable error instead of an on-chain
    // InsufficientLiquidity revert when funds are locked in the sentinel.
    if (maxRedeemableSharesWei !== undefined && sharesBigInt > maxRedeemableSharesWei) {
      toast.error(
        `You can redeem up to ${parseFloat(formattedMaxRedeemable ?? '0').toFixed(4)} shares right now — the rest of the value is locked in the sentinel.`
      )
      return
    }
    await runAction(() => redeem(sharesBigInt), 'Redemption successful')
  }

  async function handleClaimPersonalFees() {
    await runAction(() => claimFeesForSelf(), 'Fees claimed')
  }

  async function handleClaimCreatorRewards() {
    await runAction(
      () => claimFeesForSyndicate(),
      'Creator fees claimed and distributed'
    )
  }

  const canDeposit = !whitelistEnabled || isWhitelisted
  const memberRows =
    meta?.members_detailed ??
    meta?.members.map(addr => buildFallbackMember(addr, meta.owner)) ??
    []

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pb-20">
      <div className="mx-auto max-w-6xl px-6 pt-12 lg:px-12">
        <SyndicateHero meta={meta} />

        <SyndicateMetricsGrid
          isContractLoading={!meta}
          isMemberLoading={isMemberLoading}
          formattedTVL={formattedTVL}
          formattedIdle={formattedIdle}
          formattedPendingFees={formattedPendingFees}
        />

        <section className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <SyndicateOwnerControls
            agentId={agentId}
            whitelistEnabled={whitelistEnabled}
            isLocked={isLocked}
            openModal={openModal}
          />
          {connectedAddress ? (
            <SyndicateMemberPortal
              shares={shares}
              pendingFees={pendingFees}
              canDeposit={canDeposit}
              agentId={agentId}
              tokenSymbol={tokenSymbol}
              unclaimedCreatorFees={formattedUnclaimedCreatorFees}
              hasUnclaimedCreatorFees={hasUnclaimedCreatorFees}
              openModal={openModal}
            />
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 border border-[var(--color-border-default)] py-16">
              <Wallet className="h-12 w-12 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">
                Connect your wallet to interact with this syndicate
              </p>
            </div>
          )}
        </section>

        {meta && (
          <SyndicateMembersTable
            members={memberRows}
            tokenSymbol={tokenSymbol}
            tokenDecimals={tokenDecimals}
          />
        )}
      </div>

      <FundSentinelModal
        open={activeModal === 'fundSentinel'}
        onClose={closeModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        tokenSymbol={tokenSymbol}
        formattedIdle={formattedIdle}
        loading={ownerLoading === 'fundAgent'}
        onSubmit={handleFundAgent}
      />
      <WithdrawSentinelModal
        open={activeModal === 'withdrawSentinel'}
        onClose={closeModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        tokenSymbol={tokenSymbol}
        unlockTimestamp={unlockTimestamp}
        loading={ownerLoading === 'withdraw'}
        onSubmit={handleWithdraw}
      />
      <WhitelistModal
        open={activeModal === 'whitelist'}
        onClose={closeModal}
        whitelistInput={whitelistInput}
        setWhitelistInput={setWhitelistInput}
        loading={ownerLoading === 'whitelistAddrs'}
        onSubmit={handleWhitelistAdd}
      />
      <VisibilityModal
        open={activeModal === 'visibility'}
        onClose={closeModal}
        whitelistEnabled={whitelistEnabled}
        loading={ownerLoading === 'whitelist'}
        onSubmit={handleToggleVisibility}
      />
      <DepositModal
        open={activeModal === 'deposit'}
        onClose={closeModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        tokenSymbol={tokenSymbol}
        walletBalance={formattedWalletBalance}
        loading={memberLoading === 'deposit'}
        onSubmit={handleDeposit}
      />
      <RedeemModal
        open={activeModal === 'redeem'}
        onClose={closeModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        tokenSymbol={tokenSymbol}
        formattedShares={formattedShares}
        formattedMaxRedeemable={formattedMaxRedeemable}
        formattedIdle={formattedIdle}
        loading={memberLoading === 'redeem'}
        onSubmit={handleRedeem}
      />
      <ClaimPersonalFeesModal
        open={activeModal === 'claimFees'}
        onClose={closeModal}
        tokenSymbol={tokenSymbol}
        formattedPendingFees={formattedPendingFees}
        loading={memberLoading === 'claimSelf'}
        onSubmit={handleClaimPersonalFees}
      />
      <CreatorRewardsModal
        open={activeModal === 'creatorRewards'}
        onClose={closeModal}
        loading={memberLoading === 'claimForSyndicate'}
        tokenSymbol={tokenSymbol}
        unclaimedCreatorFees={formattedUnclaimedCreatorFees}
        onSubmit={handleClaimCreatorRewards}
      />
    </div>
  )
}
