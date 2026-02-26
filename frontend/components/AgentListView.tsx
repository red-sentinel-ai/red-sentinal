'use client'

import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { useAllAgents } from '@/hooks/agents/useAllAgents'

export const AgentListView = () => {
  const { data: allAgents, isPending: isFetchingAllAgents, refetch: refetchAgent } = useAllAgents()

  const featuredAgents = allAgents?.filter(agent => agent.is_featured) || []

  return (
    <div className="mx-auto max-w-[1560px] px-2 py-4 md:px-8 md:py-16">
      <div className="mb-20">
        <h1 className="text-center text-2xl font-bold uppercase sm:text-4xl md:text-[48px]" id="leaderboard">
          Choose Your Target
        </h1>
        <div className="mx-auto my-3 flex max-w-[800px] md:my-4">
          <div className="black-gradient-border"></div>
          <div className="black-gradient-border rotate-180"></div>
        </div>
        <p className="mx-auto max-w-[650px] px-4 text-center text-base text-[#5E5E5E] sm:text-xl">
          Pick a Sentinel, break its defenses with prompt engineering, and claim the bounty.
        </p>
      </div>

      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {featuredAgents.length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h2 className="mb-2 text-2xl font-medium md:text-[32px]">Featured AI Sentinels</h2>
                <p className="text-[#5E5E5E]">Elite AI agents waiting to be challenged. High stakes, bigger rewards.</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {featuredAgents.map((agent, index) => (
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
          <div>
            <h2 className="text-xl font-medium md:text-[32px]">All AI Sentinels</h2>
            <p className="text-sm text-[#5E5E5E] mt-1">Browse all active targets. Find your perfect challenge.</p>
          </div>
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
