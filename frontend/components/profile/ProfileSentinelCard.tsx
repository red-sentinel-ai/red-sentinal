'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { type Agent } from '@/types/agents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import { getTokenForCoinType } from '@/constants/tokens'
import { CHAINS, type SupportedChain } from '@/constants/chains'
import { AgentDropdown } from '../agents/AgentCardDropdown'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { cn, formatDuration, truncateAddress } from '@/lib/utils'
import { PrizePoolChangeDisplay } from '../agents/PrizePoolChangeDisplay'
import { TokenAmount } from '../ui/common/TokenAmount'
import { Flame } from 'lucide-react'

export type ClaimFeesTarget = {
  agentId: string
  agentObjectId: string
  accumulatedFees: number
  coinType?: string
  chain?: SupportedChain
}

type ProfileSentinelCardProps = {
  agent: Agent
  index: number
  ctaHeading?: string
  fromProfile?: boolean
  onFund: ReturnType<typeof useFundAgentModal>['openModal']
  onWithdraw: ReturnType<typeof useWithdrawAgentModal>['openModal']
  onFeature: (agentId: string) => void
  onClaimFees: (target: ClaimFeesTarget) => void
}

export const ProfileSentinelCard = ({
  agent,
  index,
  ctaHeading = 'Challenge Sentinel',
  fromProfile = false,
  onFund,
  onWithdraw,
  onFeature,
  onClaimFees,
}: ProfileSentinelCardProps) => {
  const router = useRouter()
  const { address: connectedAddress } = useConnectedAddress()
  const isOwner = !!connectedAddress && connectedAddress.toLowerCase() === agent.creator?.toLowerCase()

  const [isWithdrawalLocked, setIsWithdrawalLocked] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState('')

  const token = getTokenForCoinType(agent.coin_type, agent.chain)
  const tokenDivisor = Math.pow(10, token.decimals)

  const hasNoBalance = Number(agent.total_balance) === 0
  const isAttackPaused = !isWithdrawalLocked && Number(agent.unlock_timestamp) > 0
  const earnings = Number(agent.accumulated_fees || 0) / tokenDivisor
  const hasEarnings = earnings > 0

  // Once defeated, the bounty is paid out to the attacker — no funds remain to manage,
  // so we suppress every owner action and surface who claimed the bounty instead.
  const isDefeated = agent.state === 'defeated'
  const defeaterAddress = agent.winner?.address || null

  useEffect(() => {
    if (hasNoBalance) {
      setIsWithdrawalLocked(false)
      setTimeRemaining('')
      return
    }

    const unlock = Number(agent.unlock_timestamp)

    if (!unlock || unlock === 0) {
      setIsWithdrawalLocked(false)
      setTimeRemaining('Unlocked')
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = unlock - now

      if (diff <= 0) {
        setIsWithdrawalLocked(false)
        setTimeRemaining('Unlocked')
        return null // Stop interval
      }

      setIsWithdrawalLocked(true)
      const formatted = formatDuration(diff)
      const days = formatted.days > 0 ? `${formatted.days}d ` : ''
      const hours = formatted.hours > 0 || formatted.days > 0 ? `${formatted.hours}h ` : ''
      const mins = `${formatted.minutes}m`

      setTimeRemaining(`Locked: ${days}${hours}${mins}`)
      return true // Continue interval
    }

    if (!updateTimer()) {
      return // Already unlocked
    }

    // Update timer every minute
    const interval = setInterval(() => {
      if (!updateTimer()) {
        clearInterval(interval)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [agent.unlock_timestamp, hasNoBalance])

  const handleAttack = () => {
    router.push(`/attack/${agent.agent_path}`)
  }

  return (
    <motion.div
      className="agent-card group flex flex-col overflow-hidden rounded-lg p-[1px] lg:rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="h-full w-full overflow-hidden rounded-lg bg-[var(--color-bg-deepest)] p-2 shadow-[var(--shadow-card)] lg:rounded-xl lg:p-4">
        <div className="relative mb-2">
          <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--color-bg-subtle)]">
            {agent.agent_image ? (
              <Image
                src={agent.agent_image || '/placeholder.svg'}
                alt={`${agent.agent_name} profile`}
                fill
                className="z-10 rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="relative z-10 text-2xl font-medium">
                {agent.agent_name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <div
              className={`absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                agent.state === 'active'
                  ? 'border border-[var(--color-success)] bg-[var(--color-success-muted)] text-[var(--color-success)]'
                  : 'border border-[var(--color-danger)]/20 bg-[var(--color-danger-muted)] text-[var(--color-danger)]'
              }`}
            >
              <Image
                src={agent.state === 'active' ? '/icons/shield-green.png' : '/icons/shield-red.png'}
                width={14}
                height={14}
                alt={agent.state === 'active' ? 'Active' : 'Defeated'}
                className="size-3 sm:size-3.5"
              />
              {agent.state === 'active' ? 'Active' : 'Defeated'}
            </div>

            {agent.trending && (
              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-900/20 px-2 py-0.5 text-[10px] font-medium leading-none text-amber-400">
                <Flame className="size-2.5 sm:size-3" />
                Trending
              </div>
            )}

            <AgentDropdown
              isOwner={isOwner}
              isFeatured={agent.is_featured}
              agentId={agent.agent_id}
              agentObjectId={agent.agent_object_id}
              currentPrompt={agent.prompt}
              currentCost={Number(agent.cost_per_message)}
              openFeatureModal={onFeature}
              accumulatedFees={agent.accumulated_fees}
              createdAt={agent.timestampMs}
              coinType={agent.coin_type}
              chain={agent.chain}
              isDefeated={isDefeated}
            />
          </div>
        </div>

        <div className="mb-2 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            <h3 className="truncate text-sm font-medium text-[var(--color-text-primary)]">
              {agent.agent_name}
            </h3>
            {agent.is_featured && (
              <Image
                src="/icons/check-mark.svg"
                width={20}
                height={20}
                alt="Verified"
                className="size-4 sm:size-5"
              />
            )}
          </div>
          <div className="mb-2 flex items-center justify-center gap-1">
            <Image
              src={CHAINS[agent.chain ?? 'sui'].icon}
              alt={CHAINS[agent.chain ?? 'sui'].name}
              width={13}
              height={13}
              className={`rounded-full ${CHAINS[agent.chain ?? 'sui'].iconFilterClass}`}
            />
            <span className="text-xs text-[var(--color-text-muted)]">
              {CHAINS[agent.chain ?? 'sui'].name}
            </span>
          </div>
          <div className="mx-auto flex max-w-[394px] border-t border-[var(--color-border-subtle)]"></div>
        </div>

        <div className="mb-2 space-y-1 text-xs font-medium tabular-nums">
          {isDefeated ? (
            <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
              <span className="text-[var(--color-text-secondary)]">Total Bounty Won:</span>
              <div className="flex items-center justify-end font-semibold text-[var(--color-danger)]">
                <TokenAmount rawAmount={agent.winner?.amount_won ?? 0} token={token} precision={4} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
              <span className="text-[var(--color-text-secondary)]">Prize Pool:</span>
              <div className="flex items-center justify-end">
                <span className="mr-1 sm:mr-2"><TokenAmount rawAmount={agent.total_balance} token={token} precision={4} /></span>
                <PrizePoolChangeDisplay prizePoolHistory={agent.prizePoolHistory} variant="card" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
            <span className="text-[var(--color-text-secondary)]">Message Cost:</span>
            <span className="text-right"><TokenAmount rawAmount={agent.cost_per_message} token={token} precision={4} /></span>
          </div>
          {!isDefeated && fromProfile && isOwner && (
            <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
              <span className="text-[var(--color-text-secondary)]">Your Earnings:</span>
              <span className={`text-right ${hasEarnings ? 'font-semibold text-[var(--color-success)]' : ''}`}>
                <TokenAmount rawAmount={agent.accumulated_fees || 0} token={token} precision={4} />
              </span>
            </div>
          )}
        </div>

        {!isDefeated && fromProfile && isOwner && timeRemaining && (
          <div className="mb-2 text-center text-[10px]">
            {isWithdrawalLocked ? (
              <span className="font-medium text-[var(--color-warning)]">{timeRemaining}</span>
            ) : (
              <span className="font-medium text-[var(--color-success)]">Ready to Withdraw</span>
            )}
          </div>
        )}
        {!isDefeated && fromProfile && isOwner && isAttackPaused && (
          <div className="mb-2 rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-center text-[10px] text-yellow-400">
            Attacks are paused, add funds to resume
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 sm:gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              handleAttack()
            }}
            className={cn(
              'btn btn-black w-full text-xs',
              isDefeated && fromProfile && isOwner ? 'mt-[46px]' : 'h-8'
            )}
          >
            {fromProfile && isOwner ? 'Manage Sentinel' : isDefeated ? 'View Sentinel' : ctaHeading}
          </button>

          {fromProfile && isOwner && (
            <>
              {isDefeated ? (
                <div className="mt-5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="shrink-0 font-semibold text-[var(--color-danger)]">
                    Defeated by
                  </span>
                  {defeaterAddress ? (
                    <Link
                      href={`/u/${defeaterAddress}`}
                      onClick={e => e.stopPropagation()}
                      className="text-accent min-w-0 truncate font-mono font-semibold underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-gold-primary)]"
                    >
                      {truncateAddress(defeaterAddress)}
                    </Link>
                  ) : (
                    <span className="min-w-0 truncate font-mono font-semibold text-[var(--color-text-muted)]">
                      Unknown
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() =>
                        onFund({
                          agentObjectId: agent.agent_object_id,
                          agentId: agent.agent_id,
                          coinType: token.coinType,
                          tokenSymbol: token.symbol,
                          tokenDecimals: token.decimals,
                          chain: agent.chain,
                        })
                      }
                      className="btn btn-black w-1/2 px-2 py-1.5 text-[10px]"
                    >
                      Add Funds
                    </button>
                    <button
                      onClick={() =>
                        onWithdraw({
                          agentObjectId: agent.agent_object_id,
                          agentId: agent.agent_id,
                          agentBalanceRaw: Number(agent.total_balance),
                          coinType: agent.coin_type,
                          chain: agent.chain,
                        })
                      }
                      className="btn btn-outline w-1/2 px-2 py-1.5 text-[10px]"
                      disabled={isWithdrawalLocked || Number(agent.total_balance) === 0}
                      title={
                        isWithdrawalLocked
                          ? timeRemaining
                          : Number(agent.total_balance) === 0
                            ? 'No funds available'
                            : 'Withdraw your funds'
                      }
                    >
                      Withdraw
                    </button>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onClaimFees({
                        agentId: agent.agent_id,
                        agentObjectId: agent.agent_object_id,
                        accumulatedFees: agent.accumulated_fees,
                        coinType: agent.coin_type,
                        chain: agent.chain,
                      })
                    }}
                    disabled={!hasEarnings}
                    className="btn btn-outline w-full px-2 py-1.5 text-[10px] disabled:opacity-50"
                    title={hasEarnings ? 'Collect your earned fees' : 'No earnings to claim yet'}
                  >
                    {hasEarnings ? (
                      <span className="inline-flex items-center gap-1">
                        Claim{' '}
                        <TokenAmount
                          rawAmount={agent.accumulated_fees || 0}
                          token={token}
                          precision={2}
                          iconSize={12}
                        />
                      </span>
                    ) : (
                      'No Earnings Yet'
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
