'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { Badge } from '@/components/ui'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
import { MIST_PER_SUI } from '@/constants'
import { RefreshCcw } from 'lucide-react'
import { PrizePoolChangeDisplay } from './agents/PrizePoolChangeDisplay'

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
          <div className="flex flex-col gap-1">
            <div className="mb-2 hidden rounded-lg border border-[#5E5E5E] p-3 text-2xl font-medium backdrop-blur-xl hover:border-black/80 md:grid md:grid-cols-12">
              <div className="col-span-1 grid grid-cols-12 items-center">
                <p className="col-span-12 pr-1">#</p>
              </div>
              <div className="col-span-1 flex items-center">
                <p className="">Agent Id</p>
              </div>

              <div className="col-span-2 ps-4">Name</div>
              <div className="col-span-1 ps-4">Balance</div>
              <div className="col-span-2 ps-4">Message Price</div>
              <div className="col-span-2 ps-4">Change (7d)</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 ps-4">Actions</div>
            </div>

            <AnimatePresence>
              {agents.map((agent, idx) => {
                const balance = (Number(agent.balance) / MIST_PER_SUI).toFixed(2)
                const costPerMessage = (Number(agent.cost_per_message) / MIST_PER_SUI).toFixed(2)

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="cursor-pointer rounded-lg border border-black/30 p-3 text-xl backdrop-blur-xl hover:border-black/80"
                    onClick={() => router.push(`/attack/${agent.agent_path}`)}
                  >
                    <div className="space-y-3 md:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="">#{idx + 1}</span>
                          <span className="truncate">{agent.agent_name}</span>
                          {agent.is_featured && (
                            <Image
                              src="/icons/check-mark.svg"
                              width={16}
                              height={16}
                              alt="checkmark"
                            />
                          )}
                        </div>
                        <Badge
                          variant={agent.status === 'Active' ? 'secondary' : 'destructive'}
                          className={`${
                            agent.status === 'Active'
                              ? 'border-[#1FAD57] bg-[#D1E6DB] text-[#1FAD57]'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                          } rounded-xl text-xs`}
                        >
                          {agent.status === 'Active' ? (
                            <Image
                              src="/icons/shield-green.png"
                              width={14}
                              height={14}
                              alt="shield green"
                              className="mr-1"
                            />
                          ) : (
                            <Image
                              src="/icons/shield-red.png"
                              width={14}
                              height={14}
                              alt="shield red"
                              className="mr-1"
                            />
                          )}
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Reward</p>
                          <p>{`${balance} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Message Price</p>
                          <p>{`${costPerMessage} SUI`}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">7d Change</p>
                          <PrizePoolChangeDisplay agentId={agent.agent_id} variant="list" />
                        </div>
                      </div>
                      <div className="flex gap-3 border-t border-gray-700/50 pt-2 text-xs">
                        <button
                          onClick={e => handleRefresh(e)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_path}`)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Attack
                        </button>
                      </div>
                    </div>

                    <div className="hidden items-center md:grid md:grid-cols-12">
                      <div className="col-span-1 flex items-center">
                        <p className="pr-1">{idx + 1}</p>
                      </div>
                      <div className="col-span-1 pl-0">{agent.agent_id}</div>

                      <div className="col-span-2 flex items-center gap-1 ps-4">
                        <p className="truncate">{agent.agent_name}</p>
                        {agent.is_featured && (
                          <Image
                            src="/icons/check-mark.svg"
                            width={20}
                            height={20}
                            alt="checkmark"
                          />
                        )}
                      </div>

                      <div className="col-span-1 ps-4">{`${balance} SUI`}</div>
                      <div className="col-span-2 ps-4">{`${costPerMessage} SUI`}</div>

                      <div className="col-span-2 ps-4">
                        <PrizePoolChangeDisplay agentId={agent.agent_id} variant="list" />
                      </div>

                      <div className="col-span-1">
                        <Badge
                          variant={agent.status === 'Active' ? 'secondary' : 'destructive'}
                          className={`${
                            agent.status === 'Active'
                              ? 'border-[#1FAD57] bg-[#D1E6DB] text-[#1FAD57]'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                          } rounded-xl text-base`}
                        >
                          {agent.status === 'Active' ? (
                            <Image
                              src="/icons/shield-green.png"
                              width={16}
                              height={16}
                              alt="shield green"
                              className="mr-1"
                            />
                          ) : (
                            <Image
                              src="/icons/shield-red.png"
                              width={16}
                              height={16}
                              alt="shield red"
                              className="mr-1"
                            />
                          )}
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center gap-4">
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_path}`)}
                          className="badge-black"
                        >
                          <Image
                            src="/icons/swords-white.png"
                            width="16"
                            height="16"
                            alt="swords"
                            className="mr-1"
                          />
                          Attack
                        </button>
                        <button onClick={e => handleRefresh(e)} className="badge-outline-black">
                          <RefreshCcw width={16} className="mr-1" />
                          Refresh
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
