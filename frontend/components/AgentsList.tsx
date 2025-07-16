'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { MIST_PER_SUI } from '@/constants'

export enum TabType {
  AgentRanking = 'AGENT_RANKING',
  ActiveAgents = 'ACTIVE_AGENTS',
  TopAttackers = 'TOP_ATTACKERS',
}

export const AgentsList = ({
  agents,
  isFetchingAgents,
  onRefreshAgent,
}: {
  agents: AgentDetails[]
  isFetchingAgents: boolean
  onRefreshAgent: () => void
}) => {
  const router = useRouter()
  const account = useCurrentAccount()
  const { Modal, openModal } = useFundAgentModal()

  const isAgentOwner = (creator: string) => creator === account?.address

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRefreshAgent()
  }

  return (
    <AnimatePresence>
      <motion.div
        key={isFetchingAgents ? 'loading' : 'content'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {isFetchingAgents ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="text-sm flex flex-col gap-1">
            <div className="hidden md:grid md:grid-cols-12 bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg mb-2 font-semibold">
              <div className="col-span-3 grid grid-cols-12 items-center">
                <p className="pr-1 col-span-1">#</p>
                <div className="h-full w-[1px] bg-[#6F6F6F]" />
                <p className="col-span-10 pl-4">Agent Id</p>
              </div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Name</div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Balance</div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Message Price</div>
              <div className="col-span-3 border-l border-l-[#6F6F6F] ps-4">Actions</div>
            </div>

            <AnimatePresence>
              {agents.map((agent, idx) => {
                const balance = (Number(agent.balance) / MIST_PER_SUI).toFixed(4)
                const costPerMessage = (Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(4)

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="bg-[#2E40494D] backdrop-blur-xl p-3 rounded-lg hover:bg-[#2E40497D] cursor-pointer"
                    onClick={() => router.push(`/attack/${agent.object_id}`)}
                  >
                    <div className="md:hidden space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">#{idx + 1}</span>
                          <span className="font-medium truncate">{agent.agent_id}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Name</p>
                          <div className="flex items-center gap-1">
                            <p>{agent.agent_name}</p>
                            {agent.is_featured && (
                              <Image
                                src="/icons/check-mark.svg"
                                width={20}
                                height={20}
                                alt="checkmark"
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Reward</p>
                          <p>{`${balance} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Message Price</p>
                          <p>{`${costPerMessage} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Creator</p>
                          <p className="truncate">{agent.owner}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button
                          onClick={(e) => handleRefresh(e)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={() => router.push(`/attack/${agent.object_id}`)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Attack
                        </button>
                        {isAgentOwner(agent.owner) && (
                          <button
                            onClick={() => openModal(agent.object_id)}
                            className="text-green-500 hover:text-green-400"
                          >
                            Fund
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:grid md:grid-cols-12 items-center">
                      <div className="col-span-3 grid grid-cols-12 items-center">
                        <p className="pr-1 col-span-1">{idx + 1}</p>
                        <div className="h-full w-[1px] bg-[#6F6F6F]" />
                        <div className="col-span-10 pl-4">{agent.agent_id}</div>
                      </div>

                      <div className="flex items-center gap-1 col-span-2 ps-4">
                        <p>{agent.agent_name}</p>
                        {agent.is_featured && (
                          <Image
                            src="/icons/check-mark.svg"
                            width={20}
                            height={20}
                            alt="checkmark"
                          />
                        )}
                      </div>

                      <div className="col-span-2 ps-4">{`${balance} SUI`}</div>
                      <div className="col-span-2 ps-4">{`${costPerMessage} SUI`}</div>
                      <div className="col-span-3 ps-4 flex gap-4">
                        <button
                          onClick={() => router.push(`/attack/${agent.object_id}`)}
                          className="text-sm text-red-700 font-bold hover:text-red-500"
                        >
                          Attack
                        </button>
                        <button
                          onClick={(e) => handleRefresh(e)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                        {isAgentOwner(agent.owner) && (
                          <button
                            onClick={() => openModal(agent.object_id)}
                            className="text-sm text-green-500 hover:text-green-400"
                          >
                            Fund
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      <Modal onSuccess={() => console.log('Funded successfully!')} />
    </AnimatePresence>
  )
}
