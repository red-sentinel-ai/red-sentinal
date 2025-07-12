import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MIST_PER_SUI } from '@/constants'
import { AgentDetails } from '@/types'
import Image from 'next/image'

export const FeaturedAgentCard = ({ agent, index }: { agent: AgentDetails; index: number }) => {
  const router = useRouter()

  const handleAttack = () => {
    router.push(`/attack/${agent.agent_object_id}`)
  }

  return (
    <motion.div
      className="border border-[#558EB4] bg-[#12121266] rounded-lg lg:rounded-2xl p-2 lg:p-4 robo-card group cursor-pointer flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={handleAttack}
    >
      {/* Agent Avatar */}
      {/* //TODO: add the profile image in the below comment */}
      {/* <div className="relative mb-4">
        <div className="w-full h-32 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/10">
          <div className="text-4xl font-bold text-[#558EB4] z-10 relative">
            {agent.agent_name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute inset-0 pointer-events-auto robo-img-defender rounded-lg transition-all"></div>
        </div>
      </div> */}

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

        <p className="text-xs text-[#B5B5B5] mb-3">Agent ID: {agent.agent_id}</p>
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
        <div className="text-xs text-[#B5B5B5] bg-[#1a1a1a] rounded p-2 max-h-16 overflow-hidden">
          <p className="line-clamp-3">{agent.system_prompt}</p>
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleAttack()
          }}
          className="block border border-[#558EB4] rounded-[8px] w-full min-h-11 p-2 transition-all text-[#558EB4] group-hover:bg-[#1388D5] group-hover:text-black group-hover:border-[#1388D5] text-center font-medium"
        >
          Attack Agent
        </button>
      </div>
    </motion.div>
  )
}

const formatBalance = (balance: number) => {
  return (Number(balance) / MIST_PER_SUI).toFixed(4) + ' SUI'
}

const formatCost = (cost: number) => {
  return (Number(cost) / MIST_PER_SUI).toFixed(4) + ' SUI'
}
