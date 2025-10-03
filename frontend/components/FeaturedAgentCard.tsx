'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { MIST_PER_SUI } from '@/constants'
import { AgentDropdown } from './agents/AgentCardDropdown'

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
  const router = useRouter()
  const account = useCurrentAccount()
  const { Modal: FeatureModal, openModal: openFeatureModal } = useFeatureAgentModal()
  const isOwner = account?.address === agent.owner

  const handleAttack = () => {
    router.push(`/attack/${agent.agent_path}`)
  }

  return (
    <motion.div
      className="border border-[#558EB4] bg-[#12121266] rounded-lg lg:rounded-2xl p-2 lg:p-4 robo-card group flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="relative mb-4">
        <div className="w-full h-52 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/10">
          {agent.agent_profile ? (
            <Image
              src={agent.agent_profile || '/placeholder.svg'}
              alt={`${agent.agent_name} profile`}
              fill
              className="object-cover rounded-lg z-10"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="text-4xl font-bold text-[#558EB4] z-10 relative">
              {agent.agent_name.charAt(0).toUpperCase()}
            </div>
          )}

          <AgentDropdown
            isOwner={isOwner}
            isFeatured={agent.is_featured}
            agentId={agent.agent_id}
            openFeatureModal={openFeatureModal}
          />

          <div className="absolute inset-0 pointer-events-auto robo-img-defender rounded-lg transition-all"></div>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1 mb-2">
          <h3 className="text-lg lg:text-xl font-bold text-white truncate">{agent.agent_name}</h3>
          {agent.is_featured && (
            <Image
              src="/icons/check-mark.svg"
              width={20}
              height={20}
              alt="checkmark"
            />
          )}
        </div>
        <div className="flex max-w-[394px] mx-auto mb-3">
          <div className="gradient-border blue"></div>
          <div className="gradient-border blue rotate-180"></div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#B5B5B5]">Reward Pool:</span>
          <span className="text-[#558EB4] font-medium">{formatBalance(agent.balance)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#B5B5B5]">Attack Cost:</span>
          <span className="text-[#558EB4] font-medium">{formatCost(agent.cost_per_message)}</span>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleAttack()
          }}
          className="block border border-[#558EB4] hover:bg-[#558EB422] rounded-[8px] w-full min-h-11 p-2 transition-all text-[#558EB4] text-center font-medium"
        >
          {ctaHeading}
        </button>

        {fromProfile && (
          <button
            onClick={() => openModal(agent.object_id)}
            className="block border border-[#558EB4] rounded-[8px] w-full min-h-11 p-2 transition-all  bg-[#1388D5] hover:bg-[#1388d5e6] text-black group-hover:border-[#1388D5] text-center font-medium"
          >
            Fund Sentinel
          </button>
        )}
      </div>

      <Modal onSuccess={() => console.log('Funded successfully!')} />
      <FeatureModal />
    </motion.div>
  )
}

const formatBalance = (balance: number) => {
  return (Number(balance) / MIST_PER_SUI).toFixed(4) + ' SUI'
}

const formatCost = (cost: number) => {
  return (Number(cost) / MIST_PER_SUI).toFixed(4) + ' SUI'
}
