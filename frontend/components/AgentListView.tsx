'use client'

import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { AgentDetails, useAllAgents } from '@/hooks/agents/useAllAgents'

type AgentListViewProps = {
  heading: string
  subheading: string
}

export const AgentListView = ({ heading, subheading }: AgentListViewProps) => {
  //TODO: show toast for failed to load agents
  const { data: allAgents, isPending: isFetchingAllAgents, refetch: refetchAgent } = useAllAgents()

  const featuredAgents = allAgents?.filter((agent: AgentDetails) => agent.is_featured) || []

  return (
    <div className="px-2 md:px-8 py-12 md:py-20 max-w-[1560px] mx-auto md:pt-36">
      <div className="mb-20">
        <p
          className="text-4xl md:text-[48px] font-bold text-center uppercase"
          id="leaderboard"
        >
          {heading}
        </p>
        <div className="flex max-w-[800px] mx-auto my-3 md:my-6">
          <div className="white-gradient-border"></div>
          <div className="white-gradient-border rotate-180"></div>
        </div>
        <p className="text-[#B4B4B4] text-center max-w-[594px] mx-auto">{subheading}</p>
      </div>

      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {featuredAgents.length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-[#558EB4] mb-2">
                  Featured Agents
                </h2>
                <div className="flex max-w-[400px] mx-auto">
                  <div className="gradient-border blue"></div>
                  <div className="gradient-border blue rotate-180"></div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {featuredAgents.map((agent: AgentDetails, index: number) => (
                    <FeaturedAgentCard
                      key={agent.agent_id}
                      agent={agent}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <div>
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h2>All Agents</h2>
        </div>
      </div>

      <AgentsList
        agents={allAgents}
        isFetchingAgents={isFetchingAllAgents}
        onRefreshAgent={refetchAgent}
      />
    </div>
  )
}
