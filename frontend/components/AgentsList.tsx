'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Badge } from '@/components/ui'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails } from '@/hooks/agents/useAllAgents'
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
            <div className="hidden md:grid md:grid-cols-12 backdrop-blur-xl p-3 rounded-lg border border-[#5E5E5E] hover:border-black/80 mb-2 font-medium text-2xl">
              <div className="col-span-3 grid grid-cols-12 items-center">
                <p className="pr-1 col-span-1">#</p>
                <div className="h-full w-[1px] bg-[#6F6F6F]" />
                <p className="col-span-10 pl-4">Agent Id</p>
              </div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Name</div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Balance</div>
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Message Price</div>
              <div className="col-span-1 border-l border-l-[#6F6F6F] ps-4">Status</div>{' '}
              <div className="col-span-2 border-l border-l-[#6F6F6F] ps-4">Actions</div>
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
                    className="backdrop-blur-xl p-3 rounded-lg border border-black/30 hover:border-black/80 cursor-pointer"
                    onClick={() => router.push(`/attack/${agent.agent_path}`)}
                  >
                    <div className="md:hidden space-y-3">
                      <div className="flex justify-between items-center">
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
                          className={
                            agent.status === 'Active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }
                        >
                          {agent.status === 'Active' ? (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <ShieldAlert className="h-3 w-3 mr-1" />
                          )}
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Reward</p>
                          <p>{`${balance} SUI`}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Message Price</p>
                          <p>{`${costPerMessage} SUI`}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs pt-2 border-t border-gray-700/50">
                        <button
                          onClick={(e) => handleRefresh(e)}
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
                      <div className="col-span-1 ps-4">
                        <Badge
                          variant={agent.status === 'Active' ? 'secondary' : 'destructive'}
                          className={
                            agent.status === 'Active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }
                        >
                          {agent.status === 'Active' ? (
                            <ShieldCheck className="h-3 w-3 mr-1" />
                          ) : (
                            <ShieldAlert className="h-3 w-3 mr-1" />
                          )}
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="col-span-2 ps-4 flex gap-4">
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_path}`)}
                          className="text-sm text-primary_pink_light hover:text-primary_pink font-bold"
                        >
                          Attack
                        </button>
                        <button
                          onClick={(e) => handleRefresh(e)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
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
