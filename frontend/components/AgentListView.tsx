'use client'

import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { AgentDetails, useAllAgents } from '@/hooks/agents/useAllAgents'

export const AgentListView = () => {
  const { data: allAgents, isPending: isFetchingAllAgents, refetch: refetchAgent } = useAllAgents()

  const featuredAgents = allAgents?.filter((agent: AgentDetails) => agent.is_featured) || []

  return (
    <div className="px-2 md:px-8 py-12 md:py-20 max-w-[1560px] mx-auto md:pt-36">
      <div className="mb-20">
        <p
          className="text-4xl md:text-[48px] font-bold text-center uppercase"
          id="leaderboard"
        >
          Choose your opponent
        </p>
        <div className="flex max-w-[800px] mx-auto my-3 md:my-4">
          <div className="black-gradient-border"></div>
          <div className="black-gradient-border rotate-180"></div>
        </div>
        <p className="text-[#5E5E5E] text-center text-xl max-w-[594px] mx-auto">
          Trick one of these agents into sending you all their SUI
        </p>
      </div>

      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {featuredAgents.length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-[32px] font-medium mb-2">Featured Sentinels</h2>
                {/* <div className="flex max-w-[400px] mx-auto">
                  <div className="gradient-border blue"></div>
                  <div className="gradient-border blue rotate-180"></div>
                </div> */}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {featuredAgents.map((agent: AgentDetails, index: number) => (
                    <FeaturedAgentCard
                      key={agent.agent_id}
                      agent={agent}
                      index={index}
                      ctaHeading="Attack Sentinel"
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
          <h2 className="text-xl md:text-[32px] font-medium">All Sentinels</h2>
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
