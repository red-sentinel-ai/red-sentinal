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
    router.push(`/attack/${agent.object_id}`)
  }

  return (
    <motion.div
      className="group flex flex-col p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="relative mb-4">
        <div className="absolute left-2 right-2 top-2 bottom-2 z-10">
          <Image
            src="/animations/card1.gif"
            width={420}
            height={400}
            alt="card"
          />
        </div>
        <div className="w-full h-36 rounded-lg flex items-center justify-center overflow-hidden z-10 relative">
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
            agentId={agent.agent_id}
            openFeatureModal={openFeatureModal}
          />
        </div>

        <div className="w-[600px] h-[700px] absolute -left-32 -top-20">
          <Image
            src="/img/bg1.png"
            fill
            alt="bg"
            className="absolute z-0 -top-32 -bottom-32"
          />
        </div>
      </div>

      <div className="p-5">
        <div className="text-center mb-4 relative z-10">
          <div className="flex items-center justify-center gap-1 mb-2">
            <h1 className="text-3xl font-bold">Secure Shield</h1>
            {/* <h3 className="text-lg lg:text-xl font-bold text-white truncate">{agent.agent_name}</h3>
            {agent.is_featured && (
              <Image
                src="/icons/check-mark.svg"
                width={20}
                height={20}
                alt="checkmark"
              />
            )} */}
          </div>
          <p className="text-xs text-[#B5B5B5] mb-3">Agent ID: {agent.agent_id}</p>
          <div className="flex max-w-[394px] mx-auto mb-3">
            <div className="gradient-border blue"></div>
            <div className="gradient-border blue rotate-180"></div>
          </div>
        </div>

        <div className="space-y-3 mb-4 relative">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex justify-between items-center gap-1">
              <span className="text-[#B5B5B5]">Reward Pool:</span>
              <span className="text-[#558EB4] font-medium">{formatBalance(agent.balance)}</span>
            </div>
            <div className="flex justify-between items-center gap-1">
              <span className="text-[#B5B5B5]">Attack Cost:</span>
              <span className="text-[#558EB4] font-medium">
                {formatCost(agent.cost_per_message)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2 relative">
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
