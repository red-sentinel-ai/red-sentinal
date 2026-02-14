'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { MIST_PER_SUI } from '@/constants'
import { AgentDropdown } from './agents/AgentCardDropdown'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { formatDuration } from '@/lib/utils'
import { PrizePoolChangeDisplay } from './agents/PrizePoolChangeDisplay'

type FeaturedAgentCardProps = {
  agent: AgentDetails
  index: number
  ctaHeading?: string
  fromProfile?: boolean
}

export const FeaturedAgentCard = ({
  agent,
  index,
  ctaHeading = 'View Sentinel',
  fromProfile = false,
}: FeaturedAgentCardProps) => {
  const { Modal, openModal } = useFundAgentModal()
  const { Modal: WithdrawModal, openModal: openWithdrawModal } = useWithdrawAgentModal()
  const router = useRouter()
  const account = useCurrentAccount()
  const { Modal: FeatureModal, openModal: openFeatureModal } = useFeatureAgentModal()
  const isOwner = account?.address === agent.creator

  const [isWithdrawalLocked, setIsWithdrawalLocked] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState('')

  const hasNoBalance = Number(agent.total_balance) === 0

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

            <AgentDropdown
              isOwner={isOwner}
              isFeatured={agent.is_featured}
              agentId={agent.agent_id}
              agentObjectId={agent.agent_object_id}
              currentPrompt={agent.prompt}
              currentCost={Number(agent.cost_per_message)}
              openFeatureModal={openFeatureModal}
              accumulatedFees={agent.accumulated_fees}
            />
          </div>
        </div>

        <div className="mb-2 text-center sm:mb-4">
          <div className="mb-1 flex items-center justify-center gap-1 sm:mb-2">
            <h3 className="truncate text-sm font-medium sm:text-lg lg:text-2xl">{agent.agent_name}</h3>
            {agent.is_featured && (
              <Image src="/icons/check-mark.svg" width={20} height={20} alt="checkmark" className="size-4 sm:size-5" />
            )}
          </div>
          <div className="mx-auto flex max-w-[394px] border-t border-gray-200"></div>
        </div>

        <div className="mb-2 space-y-1 text-xs font-medium sm:mb-4 sm:space-y-3 sm:text-base lg:text-xl">
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <span className="text-[#5E5E5E]">Reward Pool:</span>
            <div className="flex items-center">
              <span className="mr-1 sm:mr-2">{formatBalance(agent.total_balance)}</span>
              <PrizePoolChangeDisplay prizePoolHistory={agent.prizePoolHistory} variant="card" />
            </div>
          </div>
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <span className="text-[#5E5E5E]">Message price:</span>
            <span>{formatCost(agent.cost_per_message)}</span>
          </div>
        </div>

        {fromProfile && timeRemaining && (
          <div className="mb-2 text-center text-[10px] sm:mb-4 sm:text-xs">
            {isWithdrawalLocked ? (
              <span className="font-medium text-yellow-700">{timeRemaining}</span>
            ) : (
              <span className="font-medium text-green-600">Withdrawal Unlocked</span>
            )}
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
            {fromProfile ? 'View' : ctaHeading}
          </button>
          {fromProfile && (
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => openModal(agent.agent_object_id, agent.agent_id)}
                className="btn btn-black w-1/2 px-2 py-1.5 text-[10px] sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Fund
              </button>
              <button
                onClick={() => openWithdrawModal(agent.agent_object_id, agent.agent_id, Number(agent.total_balance))}
                className="btn btn-outline w-1/2 px-2 py-1.5 text-[10px] sm:px-4 sm:py-2.5 sm:text-sm"
                disabled={isWithdrawalLocked || Number(agent.total_balance) === 0}
                title={
                  isWithdrawalLocked
                    ? timeRemaining
                    : Number(agent.total_balance) === 0
                      ? 'Balance is zero'
                      : 'Withdraw funds'
                }
              >
                Withdraw
              </button>
            </div>
          )}
        </div>

        <Modal onSuccess={() => console.log('Funded successfully!')} />
        <WithdrawModal onSuccess={() => console.log('Withdrew successfully!')} />
        <FeatureModal />
      </div>
    </motion.div>
  )
}

const formatBalance = (balance: string) => {
  return (Number(balance) / MIST_PER_SUI).toFixed(4) + ' SUI'
}

const formatCost = (cost: string) => {
  return (Number(cost) / MIST_PER_SUI).toFixed(4) + ' SUI'
}
