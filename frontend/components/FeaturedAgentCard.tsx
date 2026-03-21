'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { getTokenForCoinType } from '@/constants'
import { AgentDropdown } from './agents/AgentCardDropdown'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { formatDuration } from '@/lib/utils'
import { PrizePoolChangeDisplay } from './agents/PrizePoolChangeDisplay'
import { ClaimFeesModal } from './agents/ClaimFeesModal'
import { TokenAmount } from './ui/common/TokenAmount'


type FeaturedAgentCardProps = {
  agent: AgentDetails
  index: number
  ctaHeading?: string
  fromProfile?: boolean
  // Optional modal callbacks - when provided, component won't create its own modal instances
  onFund?: (agentObjectId: string, agentId: string, coinType?: string, tokenSymbol?: string, tokenDecimals?: number) => void
  onWithdraw?: (agentObjectId: string, agentId: string, balance: number) => void
  onFeature?: (agentId: string) => void
}

export const FeaturedAgentCard = ({
  agent,
  index,
  ctaHeading = 'Challenge Sentinel',
  fromProfile = false,
  onFund,
  onWithdraw,
  onFeature,
}: FeaturedAgentCardProps) => {
  // Only create modal instances if callbacks not provided (for backward compatibility)
  const fundModal = useFundAgentModal()
  const withdrawModal = useWithdrawAgentModal()
  const featureModal = useFeatureAgentModal()
  
  // Use provided callbacks or fall back to local modal instances
  const openFundModal = onFund || fundModal.openModal
  const openWithdrawModal = onWithdraw || withdrawModal.openModal
  const openFeatureModal = onFeature || featureModal.openModal
  
  const Modal = fundModal.Modal
  const WithdrawModal = withdrawModal.Modal
  const FeatureModal = featureModal.Modal
  
  const router = useRouter()
  const account = useCurrentAccount()
  const isOwner = account?.address === agent.creator

  const [isWithdrawalLocked, setIsWithdrawalLocked] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isClaimFeesModalOpen, setIsClaimFeesModalOpen] = useState(false)

  const token = getTokenForCoinType(agent.coin_type)
  const tokenDivisor = Math.pow(10, token.decimals)

  const hasNoBalance = Number(agent.total_balance) === 0
  const isAttackPaused = !isWithdrawalLocked && Number(agent.unlock_timestamp) > 0
  const earnings = Number(agent.accumulated_fees || 0) / tokenDivisor
  const hasEarnings = earnings > 0

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
      <div className="h-full w-full overflow-hidden rounded-lg bg-white p-2 lg:rounded-xl lg:p-6">
        <div className="relative mb-2 sm:mb-4">
          <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:h-80">
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
              className={`absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-xs ${
                agent.state === 'active'
                  ? 'border border-[#1FAD57] bg-[#D1E6DB] text-[#1FAD57]'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
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

            <AgentDropdown
              isOwner={isOwner}
              isFeatured={agent.is_featured}
              agentId={agent.agent_id}
              agentObjectId={agent.agent_object_id}
              currentPrompt={agent.prompt}
              currentCost={Number(agent.cost_per_message)}
              openFeatureModal={openFeatureModal}
              accumulatedFees={agent.accumulated_fees}
              createdAt={agent.timestampMs}
              coinType={agent.coin_type}
            />
          </div>
        </div>

        <div className="mb-2 text-center sm:mb-4">
          <div className="mb-1 flex items-center justify-center gap-1 sm:mb-2">
            <h3 className="truncate text-sm font-medium sm:text-lg lg:text-2xl">
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
          <div className="mx-auto flex max-w-[394px] border-t border-gray-200"></div>
        </div>

        <div className="mb-2 space-y-1 text-xs font-medium sm:mb-4 sm:space-y-3 sm:text-base lg:text-xl">
          <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
            <span className="text-[#5E5E5E]">Prize Pool:</span>
            <div className="flex items-center justify-end">
              <span className="mr-1 sm:mr-2"><TokenAmount rawAmount={agent.total_balance} token={token} precision={4} /></span>
              <PrizePoolChangeDisplay prizePoolHistory={agent.prizePoolHistory} variant="card" />
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
            <span className="text-[#5E5E5E]">Message Cost:</span>
            <span className="text-right"><TokenAmount rawAmount={agent.cost_per_message} token={token} precision={4} /></span>
          </div>
          {fromProfile && isOwner && (
            <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-2 sm:gap-x-4">
              <span className="text-[#5E5E5E]">Your Earnings:</span>
              <span className={`text-right ${hasEarnings ? 'font-semibold text-green-600' : ''}`}>
                <TokenAmount rawAmount={agent.accumulated_fees || 0} token={token} precision={4} />
              </span>
            </div>
          )}
        </div>

        {fromProfile && timeRemaining && (
          <div className="mb-2 text-center text-[10px] sm:mb-4 sm:text-xs">
            {isWithdrawalLocked ? (
              <span className="font-medium text-yellow-700">{timeRemaining}</span>
            ) : (
              <span className="font-medium text-green-600">Ready to Withdraw</span>
            )}
          </div>
        )}
        {fromProfile && isOwner && isAttackPaused && (
          <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-center text-[10px] text-amber-700 sm:mb-4 sm:text-xs">
            Attacks are paused, add funds to resume
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1.5 sm:gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              handleAttack()
            }}
            className="btn btn-black h-9 w-full text-xs sm:h-[62px] sm:text-xl"
          >
            {fromProfile ? 'Manage Sentinel' : ctaHeading}
          </button>
          {fromProfile && (
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  const token = getTokenForCoinType(agent.coin_type)
                  openFundModal(agent.agent_object_id, agent.agent_id, token.coinType, token.symbol, token.decimals)
                }}
                className="btn btn-black w-1/2 px-2 py-1.5 text-[10px] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Add Funds
              </button>
              <button
                onClick={() =>
                  openWithdrawModal(
                    agent.agent_object_id,
                    agent.agent_id,
                    Number(agent.total_balance)
                  )
                }
                className="btn btn-outline w-1/2 px-2 py-1.5 text-[10px] sm:px-4 sm:py-2.5 sm:text-sm"
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
          )}
          {fromProfile && isOwner && (
            <button
              onClick={e => {
                e.stopPropagation()
                setIsClaimFeesModalOpen(true)
              }}
              disabled={!hasEarnings}
              className="btn btn-outline w-full px-2 py-1.5 text-[10px] disabled:opacity-50 sm:px-4 sm:py-2.5 sm:text-sm"
              title={hasEarnings ? 'Collect your earned fees' : 'No earnings to claim yet'}
            >
              {hasEarnings ? (
                <span className="inline-flex items-center gap-1">
                  Claim <TokenAmount rawAmount={agent.accumulated_fees || 0} token={token} precision={2} iconSize={16} />
                </span>
              ) : 'No Earnings Yet'}
            </button>
          )}
        </div>

        {/* Only render modals if using local instances (callbacks not provided) */}
        {!onFund && <Modal onSuccess={() => console.log('Funded successfully!')} />}
        {!onWithdraw && <WithdrawModal onSuccess={() => console.log('Withdrew successfully!')} />}
        {!onFeature && <FeatureModal />}
        <ClaimFeesModal
          open={isClaimFeesModalOpen}
          onClose={() => setIsClaimFeesModalOpen(false)}
          agentId={agent.agent_id}
          agentObjectId={agent.agent_object_id}
          accumulatedFees={agent.accumulated_fees}
          coinType={agent.coin_type}
        />
      </div>
    </motion.div>
  )
}

