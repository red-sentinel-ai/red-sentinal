'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Mic,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  WITHDRAWAL_LOCK_MS,
  SUI_SENTINEL_X_USERNAME,
} from '@/constants'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS } from '@/constants/chains'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { getExplorerObjectUrl } from '@/lib/explorer'
import type { AgentDetailsFull } from '@/hooks/agents/useAgentDetails'
import { formatDuration, cn, buildAgentShareTweetUrl, truncateAddress, generateAvatarUrl } from '@/lib/utils'
import { Skeleton } from '@/components/ui'
import { PrizePoolChartModal } from '@/components/charts/PrizePoolChartModal'
import { TokenAmount } from '../ui/common/TokenAmount'
import { SocialMissionModal } from '@/components/rewards/SocialMissionModal'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { SentinelFollowButton } from '@/components/agents/SentinelFollowButton'
import { APP_NETWORK } from '@/constants'

const SHARE_MISSION = REWARDS_CONSTANTS.DEFAULT_MISSIONS.find(m => m.type === 'share_with_hashtag')!

interface AgentSidebarProps {
  agent: AgentDetailsFull
  onReadMore?: () => void
  onTextChat?: () => void
  onVoiceChat?: () => void
}

const DUMMY_CREATOR_REWARD = 0.05

export const AgentSidebar = ({ agent, onReadMore, onTextChat, onVoiceChat }: AgentSidebarProps) => {
  const [activeSince, setActiveSince] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [shouldTruncate, setShouldTruncate] = useState(false)
  const instructionsRef = useRef<HTMLParagraphElement>(null)
  const [pageUrl, setPageUrl] = useState('')
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isChartModalOpen, setIsChartModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const { address: connectedAddress, chain: connectedChain } = useConnectedAddress()
  const isOwner =
    connectedChain === agent.chain &&
    connectedAddress?.toLowerCase() === agent.creator?.toLowerCase()

  const prizePoolData = agent.prizePoolHistory ?? null

  useEffect(() => {
    const currentUrl = window.location.href
    setPageUrl(currentUrl)
  }, [])

  const agentToken = getTokenForCoinType(agent.coin_type)
  const creatorRewardLabel = `${DUMMY_CREATOR_REWARD.toFixed(2)} ${agentToken.symbol}`

  const isSyndicate = !!agent.syndicate
  const ownerHref = agent.syndicate
    ? (agent.syndicate.syndicate_path ?? `/syndicate/${agent.syndicate.contract_address}`)
    : `/u/${agent.creator}`

  const isDrained = agent.state === 'defeated'
  const winnerAddress = agent.winner?.address ?? null

  useEffect(() => {
    if (!agent.timestampMs || isDrained) return

    const createdTime = Number(agent.timestampMs)

    const updateTimer = () => {
      const now = Date.now()
      const diff = now - createdTime
      setActiveSince(formatDuration(diff))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [agent.timestampMs, isDrained])

  useEffect(() => {
    if (isDrained) {
      setTimeRemaining('Funds Withdrawn')
      return
    }
    if (!isOwner) {
      setTimeRemaining(null)
      return
    }

    const lastFunded = Number(agent.last_funded_timestamp)
    if (lastFunded === 0) {
      setTimeRemaining('Withdrawal Unlocked')
      return
    }

    const unlockTimestamp = lastFunded + WITHDRAWAL_LOCK_MS

    const updateTimer = () => {
      const now = Date.now()
      const diff = unlockTimestamp - now

      if (diff <= 0) {
        setTimeRemaining('Withdrawal Unlocked')
        return null
      }

      const formatted = formatDuration(diff)
      setTimeRemaining(
        `${formatted.days}d ${formatted.hours}h ${formatted.minutes}m ${formatted.seconds}s`
      )
      return true
    }

    if (!updateTimer()) {
      return
    }

    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [agent.last_funded_timestamp, isDrained, isOwner])

  useEffect(() => {
    if (instructionsRef.current) {
      const lineHeight = parseFloat(getComputedStyle(instructionsRef.current).lineHeight)
      const maxHeightForFourLines = lineHeight * 4
      if (instructionsRef.current.scrollHeight > maxHeightForFourLines) {
        setShouldTruncate(true)
      } else {
        setShouldTruncate(false)
      }
    }
  }, [agent.prompt])

  const handleCopyLink = () => {
    if (pageUrl) {
      navigator.clipboard.writeText(pageUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <>
      <div className="terminal-scrollbar flex h-[calc(100vh-64px)] w-full flex-col overflow-y-auto bg-[var(--color-bg-base)]">
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
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="industrial-header text-lg text-white">{agent.agent_name}</h1>
                  <Image
                    src={CHAINS[agent.chain].icon}
                    width={18}
                    height={18}
                    alt={CHAINS[agent.chain].name}
                    className={`rounded-full ${CHAINS[agent.chain].iconFilterClass}`}
                  />
                </div>
                {agent.is_featured && (
                  <span className="industrial-header text-accent mt-1 inline-block text-[9px]">
                    VERIFIED_SENTINEL
                  </span>
                )}
              </div>
            </div>

            <SentinelFollowButton
              agentId={String(agent.agent_id)}
              chain={agent.chain}
              network={APP_NETWORK}
            />
          </div>

          {/* Attack Objective */}
          {agent.attack_goal && (
            <div className="space-y-2">
              <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
                ATTACK_OBJECTIVE
              </div>
              <div className="border-hairline bg-[var(--color-bg-base)] p-4">
                <p className="font-mono text-[14px] leading-relaxed text-white">
                  {agent.attack_goal}
                </p>
              </div>
            </div>
          )}

          {/* Active Bounty / Prize Pool */}
          <div className="space-y-2">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
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
                        'industrial-header flex items-center gap-1 text-[10px] tracking-widest',
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
            {!isDrained && prizePoolData && prizePoolData.history.length > 0 && (
              <button
                onClick={() => setIsChartModalOpen(true)}
                className="industrial-header w-full border border-[var(--color-border-strong)] bg-transparent py-2 text-[10px] tracking-[2px] text-[var(--color-text-muted)] transition-all hover:border-white hover:text-white"
              >
                VIEW_GROWTH_CHART
              </button>
            )}
          </div>

          {/* Technical Parameters Grid */}
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border-strong)]">
            {agent.model_name && (
              <div className="bg-[var(--color-bg-base)] p-4">
                <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                  MODEL
                </span>
                <span className="industrial-header text-[11px] text-white">
                  {agent.model_name.toUpperCase()}
                </span>
              </div>
            )}
            {agent.model_provider && (
              <div className="bg-[var(--color-bg-base)] p-4">
                <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                  PROVIDER
                </span>
                <span className="industrial-header text-[11px] text-white">
                  {agent.model_provider.toUpperCase()}
                </span>
              </div>
            )}
            <div className="bg-[var(--color-bg-base)] p-4">
              <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                OWNER
              </span>
              <div className="flex flex-col items-start gap-1.5">
                <Link
                  href={ownerHref}
                  className="industrial-header text-accent text-[11px] transition-opacity hover:opacity-70"
                >
                  {truncateAddress(agent.creator)}
                </Link>
                {isSyndicate && (
                  <span className="industrial-header inline-block border border-[var(--color-gold-primary)] px-1.5 py-0.5 text-[9px] tracking-widest text-[var(--color-gold-primary)]">
                    SYNDICATE
                  </span>
                )}
              </div>
            </div>
            <div className="bg-[var(--color-bg-base)] p-4">
              <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                OWNER REWARD
              </span>
              <span className="industrial-header text-[11px] text-white">{creatorRewardLabel}</span>
            </div>
          </div>

          {/* Sentinel Instructions */}
          <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
              SENTINEL_INSTRUCTIONS
            </div>
            <div className="border-hairline bg-[var(--color-bg-base)] p-4">
              <p
                ref={instructionsRef}
                className="line-clamp-4 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]"
              >
                {agent.prompt}
              </p>
              {shouldTruncate && onReadMore && (
                <div className="mt-3">
                  <button
                    onClick={onReadMore}
                    className="industrial-header border-b border-white text-[10px] tracking-widest text-white transition-opacity hover:opacity-70"
                  >
                    READ_ALL
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* System Telemetry */}
          <div className="space-y-3 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
              SYSTEM_TELEMETRY
            </div>
            <div className="grid grid-cols-2 gap-4">
              {!isDrained && (
                <div>
                  <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                    ACTIVE_SINCE
                  </span>
                  <span className="industrial-header text-[11px] tabular-nums text-white">
                    {activeSince.days}D {String(activeSince.hours).padStart(2, '0')}H{' '}
                    {String(activeSince.minutes).padStart(2, '0')}M{' '}
                    {String(activeSince.seconds).padStart(2, '0')}S
                  </span>
                </div>
              )}
              <div>
                <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                  BREAK_ATTEMPTS
                </span>
                <span className="industrial-header text-[11px] tabular-nums text-white">
                  {agent.total_attacks.toLocaleString()}
                </span>
              </div>
              {isDrained && winnerAddress && (
                <div>
                  <span className="industrial-header mb-1 block text-[9px] text-[var(--color-text-muted)]">
                    WINNER
                  </span>
                  <Link
                    href={`/u/${winnerAddress}`}
                    className="industrial-header text-accent text-[11px] transition-opacity hover:opacity-70"
                  >
                    {truncateAddress(winnerAddress)}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Message Price */}
          {/* <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
              ATTACK_FEE
            </div>
            <div className="industrial-header text-lg tabular-nums text-white">
              <TokenAmount
                rawAmount={agent.current_cost_per_message ?? agent.cost_per_message}
                token={agentToken}
                precision={4}
                iconSize={20}
              />
            </div>
            {agent.current_cost_per_message &&
              agent.current_cost_per_message !== agent.cost_per_message && (
                <p className="flex items-center gap-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                  <span>BASE:</span>{' '}
                  <TokenAmount
                    rawAmount={agent.cost_per_message}
                    token={agentToken}
                    precision={4}
                    iconSize={10}
                  />
                </p>
              )}
          </div> */}

          {/* Withdrawal Lock (Owner Only) */}
          {isOwner && !isDrained && (
            <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
              <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
                WITHDRAWAL_LOCK
              </div>
              {timeRemaining ? (
                <p
                  className={cn(
                    'industrial-header text-sm',
                    timeRemaining === 'Withdrawal Unlocked'
                      ? 'text-[var(--color-success)]'
                      : 'text-accent'
                  )}
                >
                  {timeRemaining.toUpperCase()}
                </p>
              ) : (
                <Skeleton className="h-5 w-32" />
              )}
            </div>
          )}

          {/* Object ID */}
          <div className="space-y-2 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
              SENTINEL_OBJECT_ID
            </div>
            <Link
              href={getExplorerObjectUrl(agent.agent_object_id, agent.chain)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
              title={agent.agent_object_id}
            >
              <span className="industrial-header text-[11px] text-[var(--color-text-secondary)] transition-colors group-hover:text-white">
                {truncateAddress(agent.agent_object_id)}
              </span>
              <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)] transition-colors group-hover:text-white" />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTextChat}
                className="button-ghost-terminal flex items-center justify-center gap-2 py-3"
              >
                <MessageSquare className="h-4 w-4" />
                <span>TEXT</span>
              </button>
              <button
                type="button"
                onClick={onVoiceChat}
                className="button-ghost-terminal flex items-center justify-center gap-2 py-3"
              >
                <Mic className="h-4 w-4" />
                <span>VOICE</span>
              </button>
            </div>
            <button
              onClick={handleCopyLink}
              className="industrial-header flex w-full items-center justify-center gap-2 border border-[var(--color-border-strong)] py-3 text-[11px] tracking-[2px] text-[var(--color-text-muted)] transition-all hover:border-white hover:text-white"
            >
              <LinkIcon className="h-3 w-3" />
              SHARE_LINK
            </button>
          </div>

          {/* Earn Sentinel Tokens */}
          <div className="space-y-3 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-[10px] text-[var(--color-text-muted)]">
              EARN_REWARDS
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              Share about Red Sentinel on X and earn Sentinel tokens.
            </p>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="button-ghost-terminal w-full py-3"
            >
              SHARE_ON_X
            </button>
          </div>

          {/* Defender Profile */}
          {/* <DefenderProfile
            ownerAddress={agent.creator}
            profile={defenderProfile}
            isLoading={isLoadingProfile}
          /> */}

          {/* QR Code */}
          {/* <div className="space-y-3 border-t border-[var(--color-border-strong)] pt-6">
            <div className="industrial-header text-center text-[9px] leading-relaxed text-[var(--color-text-muted)]">
              SCAN_QR_FOR_MOBILE_WALLET_ATTACK
            </div>
            <div className="flex justify-center border border-[var(--color-border-strong)] p-4">
              {deepLinkUrl ? (
                <QRCodeSVG
                  value={deepLinkUrl}
                  size={96}
                  bgColor="#00000000"
                  fgColor="#ffffff"
                  level="L"
                  includeMargin={true}
                  className="h-24 w-24"
                />
              ) : (
                <div className="flex h-24 w-24 animate-pulse items-center justify-center bg-[var(--color-bg-subtle)]">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-transparent" />
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>

      <PrizePoolChartModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        data={prizePoolData?.history.map(p => ({ time: new Date(p.time), value: p.value })) || []}
        agentName={agent.agent_name}
        tokenSymbol={agentToken.symbol}
      />

      <SocialMissionModal
        mission={SHARE_MISSION}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        actionUrlOverride={
          pageUrl
            ? buildAgentShareTweetUrl(agent.agent_name, pageUrl, SUI_SENTINEL_X_USERNAME)
            : undefined
        }
        actionLabelOverride={`Share ${agent.agent_name} on X`}
        submissionContext={{ agent_path: `/attack/${agent.agent_path}` }}
      />
    </>
  )
}
