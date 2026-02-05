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
    <div className="mx-auto max-w-[1560px] px-2 py-4 md:px-8 md:py-16">
      <div className="mb-20">
        <p className="text-center text-2xl font-bold uppercase sm:text-4xl md:text-[48px]" id="leaderboard">
          Choose your opponent
        </p>
        <div className="mx-auto my-3 flex max-w-[800px] md:my-4">
          <div className="black-gradient-border"></div>
          <div className="black-gradient-border rotate-180"></div>
        </div>
        <p className="mx-auto max-w-[594px] px-4 text-center text-base text-[#5E5E5E] sm:text-xl">
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
                <h2 className="mb-2 text-2xl font-medium md:text-[32px]">Featured Sentinels</h2>
                {/* <div className="flex max-w-[400px] mx-auto">
                  <div className="gradient-border blue"></div>
                  <div className="gradient-border blue rotate-180"></div>
                </div> */}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
        <div className="mb-6 flex flex-col items-center justify-between md:flex-row">
          <h2 className="text-xl font-medium md:text-[32px]">All Sentinels</h2>
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
