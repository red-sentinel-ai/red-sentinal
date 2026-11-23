'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { TrendingUp, TrendingDown, MessageSquare, Mic, ExternalLink } from 'lucide-react'
import { WITHDRAWAL_LOCK_MS } from '@/constants'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS, isEvmChain } from '@/constants/chains'
import { supportsDonations } from '@/constants/evm'
import { isSentinelAttackable } from '@/lib/sentinel-status'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { getExplorerObjectUrl, getExplorerTxUrl } from '@/lib/explorer'
import type { Agent } from '@/types/agents'
import { formatDuration, cn, truncateAddress, generateAvatarUrl, formatSentinelId } from '@/lib/utils'
import { Skeleton } from '@/components/ui'
// recharts (~100KB gz) loads only when the growth chart is opened.
const PrizePoolChartModal = dynamic(
  () => import('@/components/charts/PrizePoolChartModal').then(m => m.PrizePoolChartModal),
  { ssr: false }
)
import { DonateFundsModal } from '@/components/agents/DonateFundsModal'
import { TokenAmount } from '../ui/common/TokenAmount'
import { SentinelFollowButton } from '@/components/agents/SentinelFollowButton'
import { APP_NETWORK } from '@/constants'

// Ticking clocks live in leaf components on purpose: a 1s setState in the
// parent would re-render this whole sidebar (and its modals) every second.
function WithdrawalLockTimer({ lastFundedMs }: { lastFundedMs: number }) {
  const unlockTimestamp = lastFundedMs + WITHDRAWAL_LOCK_MS
  const [remaining, setRemaining] = useState<string | null>(null)

  useEffect(() => {
    const updateTimer = () => {
      const diff = unlockTimestamp - Date.now()
      if (diff <= 0) {
        setRemaining('Withdrawal Unlocked')
        return false
      }
      const formatted = formatDuration(diff)
      setRemaining(
        `${formatted.days}d ${formatted.hours}h ${formatted.minutes}m ${formatted.seconds}s`
      )
      return true
    }

    if (!updateTimer()) return

    const interval = setInterval(() => {
      if (!updateTimer()) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [unlockTimestamp])

  if (remaining === null) return <Skeleton className="h-5 w-32" />

  return (
    <p
      className={cn(
        'industrial-header text-sm font-semibold tracking-[0.08em]',
        remaining === 'Withdrawal Unlocked' ? 'text-[var(--color-success)]' : 'text-accent'
      )}
    >
      {remaining.toUpperCase()}
    </p>
  )
}

interface AgentSidebarProps {
  agent: Agent
  onTextChat?: () => void
  onVoiceChat?: () => void
  /** Called after a confirmed bounty donation so the page can refetch the agent. */
  onDonated?: () => void
}

interface SentinelReference {
  label: string
  value: string
  href: string
}

function getSentinelReference(agent: Agent): SentinelReference | null {
  if (isEvmChain(agent.chain)) {
    if (!agent.deployment_tx_hash) return null
    return {
      label: 'DEPLOYMENT_TX',
      value: agent.deployment_tx_hash,
      href: getExplorerTxUrl(agent.deployment_tx_hash, agent.chain),
    }
  }

  return {
    label: 'SENTINEL_OBJECT_ID',
    value: agent.agent_object_id,
    href: getExplorerObjectUrl(agent.agent_object_id, agent.chain),
  }
}

interface SentinelModelSpec {
  label: string
  value: string
}

function getModelSpecs(agent: Agent): SentinelModelSpec[] {
  return [
    { label: 'PROVIDER', value: agent.model_provider },
    { label: 'MODEL', value: agent.model_name },
  ].filter(spec => Boolean(spec.value))
}

interface SentinelOwnerLink {
  label: string
  href: string
}

function getSentinelOwnerLink(agent: Agent): SentinelOwnerLink {
  const { syndicate } = agent

  if (syndicate) {
    return {
      label: truncateAddress(agent.creator),
      href: syndicate.syndicate_path ?? `/syndicate/${syndicate.contract_address}`,
    }
  }

  const ownerUsername = agent.defender_profile?.username
  if (ownerUsername) {
    return { label: ownerUsername, href: `/u/${ownerUsername}` }
  }

  return { label: truncateAddress(agent.creator), href: `/u/${agent.creator}` }
}

export const AgentSidebar = ({ agent, onTextChat, onVoiceChat, onDonated }: AgentSidebarProps) => {
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false)

  const { address: connectedAddress, chain: connectedChain } = useConnectedAddress()
  const isOwner =
    connectedChain === agent.chain &&
    connectedAddress?.toLowerCase() === agent.creator?.toLowerCase()

  const prizePoolData = agent.prizePoolHistory ?? null

  const agentToken = getTokenForCoinType(agent.coin_type, agent.chain)
  const creatorReward = (agent.accumulated_fees ?? 0) / Math.pow(10, agentToken.decimals)
  const creatorRewardLabel = `${creatorReward.toFixed(2)} ${agentToken.symbol}`

  const isSyndicate = !!agent.syndicate
  const ownerLink = getSentinelOwnerLink(agent)

  const sentinelReference = getSentinelReference(agent)
  const modelSpecs = getModelSpecs(agent)

  const isDrained = agent.state === 'defeated'

  const canDonate = supportsDonations(agent.chain) && isSentinelAttackable(agent)

  return (
    <>
      <div className="terminal-scrollbar flex h-[calc(100dvh-var(--topbar-h))] w-full flex-col overflow-y-auto bg-[var(--color-bg-base)]">
        <div className="space-y-8 p-6 lg:p-8">
          {/* Agent Profile Card */}
          <div className="space-y-4">
            <div className="border-hairline flex items-center gap-4 bg-[var(--color-bg-elevated)] p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden border border-[var(--color-border-strong)] transition-all">
                <Image
                  src={agent.agent_image || generateAvatarUrl(agent.agent_id)}
                  width={64}
                  height={64}
                  alt={agent.agent_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="industrial-header truncate text-lg text-white">
                    {agent.agent_name}
                  </h1>
                  <Image
                    src={CHAINS[agent.chain].icon}
                    width={18}
                    height={18}
                    alt={CHAINS[agent.chain].name}
                    className={`shrink-0 rounded-full ${CHAINS[agent.chain].iconFilterClass}`}
                  />
                </div>
                {agent.is_featured && (
                  <span className="industrial-header text-accent mt-1 inline-block text-[10px] font-semibold tracking-[0.06em]">
                    VERIFIED_SENTINEL
                  </span>
                )}
              </div>
              <span
                className="industrial-header shrink-0 self-start border border-[var(--color-border-strong)] px-1.5 py-0.5 text-[10px] font-medium tracking-[0.06em] text-[var(--color-text-muted)]"
                title="Sentinel ID"
              >
                ID {formatSentinelId(agent.agent_id)}
              </span>
            </div>

            <SentinelFollowButton
              agentId={String(agent.agent_id)}
              chain={agent.chain}
              network={APP_NETWORK}
            />
          </div>

          {/* Active Bounty / Prize Pool */}
          <div className="space-y-2">
            <div className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
              {isDrained ? 'TOTAL_BOUNTY_WON' : 'ACTIVE_BOUNTY'}
            </div>
            <div className="border-hairline group relative overflow-hidden bg-[var(--color-bg-base)] p-6">
              {/* Background Graph */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
                preserveAspectRatio="none"
                viewBox="0 0 400 100"
              >
                <path
                  d="M0,80 Q50,75 100,60 T200,50 T300,30 T400,10"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>

              <div className="relative z-10">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="industrial-header text-2xl tabular-nums text-white lg:text-3xl">
                    <TokenAmount
                      rawAmount={isDrained ? agent.winner?.amount_won || 0 : agent.total_balance}
                      token={agentToken}
                      precision={4}
                      iconSize={24}
                    />
                  </div>
                  {!isDrained && prizePoolData && prizePoolData.history.length > 0 && (
                    <div
                      className={cn(
                        'industrial-header flex items-center gap-1 text-[11px] font-semibold tracking-[0.06em]',
                        prizePoolData.change7d.percentage >= 0
                          ? 'text-accent'
                          : 'text-[var(--color-danger)]'
                      )}
                    >
                      {prizePoolData.change7d.percentage >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {prizePoolData.change7d.percentage != null &&
                        isFinite(prizePoolData.change7d.percentage)
                          ? `${prizePoolData.change7d.percentage >= 0 ? '+' : ''}${prizePoolData.change7d.percentage.toFixed(1)}% WEEKLY`
                          : 'NEW'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {canDonate && (
              <button
                onClick={() => setIsDonateModalOpen(true)}
                className="industrial-header w-full border border-white bg-transparent py-2 text-[10px] tracking-[0.06em] text-white transition-all hover:bg-white hover:text-black"
              >
                DONATE_FUNDS
              </button>
            )}
            {!isDrained && prizePoolData && prizePoolData.history.length > 0 && (
              <button
                onClick={() => setIsChartModalOpen(true)}
                className="industrial-header w-full border border-[var(--color-border-strong)] bg-transparent py-2 text-[10px] tracking-[0.06em] text-[var(--color-text-muted)] transition-all hover:border-white hover:text-white"
              >
                VIEW GROWTH CHART
              </button>
            )}
          </div>

          {/* Owner + Reward */}
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border-strong)]">
            <div className="min-w-0 bg-[var(--color-bg-base)] p-4">
              <span className="industrial-header mb-1 block text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
                OWNER
              </span>
              <div className="flex flex-col items-start gap-1.5">
                <Link
                  href={ownerLink.href}
                  title={agent.creator}
                  className="industrial-header text-accent max-w-full truncate text-[11px] font-semibold tracking-[0.06em] transition-opacity hover:opacity-70"
                >
                  {ownerLink.label}
                </Link>
                {isSyndicate && (
                  <span className="industrial-header inline-block border border-[var(--color-gold-primary)] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[var(--color-gold-primary)]">
                    SYNDICATE
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0 bg-[var(--color-bg-base)] p-4">
              <span className="industrial-header mb-1 block text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
                OWNER REWARD
              </span>
              <span className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-white">
                {creatorRewardLabel}
              </span>
            </div>
          </div>

          {/* Model + Provider */}
          {modelSpecs.length > 0 && (
            <div
              className={cn(
                'grid gap-px bg-[var(--color-border-strong)]',
                modelSpecs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {modelSpecs.map(spec => (
                <div key={spec.label} className="min-w-0 bg-[var(--color-bg-base)] p-4">
                  <span className="industrial-header mb-1 block text-[10px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
                    {spec.label}
                  </span>
                  <span
                    className="industrial-header break-all text-[11px] font-semibold tracking-[0.06em] text-white"
                    title={spec.value}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onTextChat}
              className="button-solid-terminal flex items-center justify-center gap-2 py-3"
            >
              <MessageSquare className="h-4 w-4" />
              <span>TEXT</span>
            </button>
            <button
              type="button"
              onClick={onVoiceChat}
              className="button-solid-terminal flex items-center justify-center gap-2 py-3"
            >
              <Mic className="h-4 w-4" />
              <span>VOICE</span>
            </button>
          </div>

          {/* Withdrawal Lock (Owner Only) */}
          {isOwner && !isDrained && (
            <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
              <div className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
                WITHDRAWAL_LOCK
              </div>
              <WithdrawalLockTimer lastFundedMs={Number(agent.last_funded_timestamp)} />
            </div>
          )}

          {/* On-chain reference: sentinel object/account id (Sui/Solana) or deployment tx (EVM) */}
          {sentinelReference && (
            <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
              <div className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-muted)]">
                {sentinelReference.label}
              </div>
              <Link
                href={sentinelReference.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2"
                title={sentinelReference.value}
              >
                <span className="industrial-header text-[11px] font-semibold tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors group-hover:text-white">
                  {truncateAddress(sentinelReference.value)}
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)] transition-colors group-hover:text-white" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {isChartModalOpen && (
        <PrizePoolChartModal
          open
          onClose={() => setIsChartModalOpen(false)}
          data={prizePoolData?.history.map(p => ({ time: new Date(p.time), value: p.value })) || []}
          agentName={agent.agent_name}
          tokenSymbol={agentToken.symbol}
        />
      )}

      {canDonate && (
        <DonateFundsModal
          open={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
          agent={agent}
          onDonated={onDonated}
        />
      )}
    </>
  )
}
