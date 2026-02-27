'use client'

import { useState } from 'react'
import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { useAllAgents } from '@/hooks/agents/useAllAgents'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

type BountyTab = 'all' | 'big_bounties'

export const AgentListView = () => {
  const { data: allAgents, isPending: isFetchingAllAgents, refetch: refetchAgent } = useAllAgents()
  const [activeTab, setActiveTab] = useState<BountyTab>('all')

  const featuredAgents = allAgents?.filter(agent => agent.is_featured && agent.state !== 'defeated') || []

  // Filter out sentinels with zero balance
  const agentsWithBalance = allAgents?.filter(agent => {
    try {
      return BigInt(agent.total_balance) > 0
    } catch {
      return false
    }
  })

  const filteredAgents =
    activeTab === 'big_bounties'
      ? agentsWithBalance?.filter(agent => {
          try {
            return BigInt(agent.total_balance) >= BIG_BOUNTY_THRESHOLD_MIST
          } catch {
            return false
          }
        })
      : agentsWithBalance

  return (
    <div className="mx-auto max-w-[1560px] px-2 py-4 md:px-8 md:py-16">
      <div className="mb-4 md:mb-20">
        <h1 className="hidden text-center text-2xl font-bold uppercase sm:text-4xl md:block md:text-[48px]" id="leaderboard">
          Choose Your Target
        </h1>
        <div className="mx-auto my-3 flex max-w-[800px] md:my-4">
          <div className="black-gradient-border hidden md:block"></div>
          <div className="black-gradient-border rotate-180 hidden md:block"></div>
        </div>
        <p className="mx-auto max-w-[650px] px-4 text-center text-base text-[#5E5E5E] sm:text-xl hidden md:block">
          Pick a Sentinel, break its defenses with prompt engineering, and claim the bounty.
        </p>
      </div>

      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {featuredAgents.length > 0 && (
            <div className="mb-8 md:mb-16">
              <div className="mb-4 md:mb-8">
                <h2 className="mb-2 text-xl font-medium md:text-[32px]">Featured AI Sentinels</h2>
                <p className="text-sm text-[#5E5E5E] md:text-base">Elite AI agents waiting to be challenged. High stakes, bigger rewards.</p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="mx-auto grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3"
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
         <div className="mb-3 md:mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div>
            <h2 className="text-lg font-medium md:text-[32px]">All AI Sentinels</h2>
            <p className="text-xs text-[#5E5E5E] mt-0.5 md:text-sm md:mt-1">Browse all active targets. Find your perfect challenge.</p>
          </div>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as BountyTab)}>
            <TabsList className="h-auto rounded-md border border-gray-200 bg-gray-100 p-[2px]">
              <TabsTrigger
                value="big_bounties"
                className="rounded-md border-b-0 py-1 sm:px-4 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Big Bounties
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-md border-b-0 py-1 sm:px-4 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <AgentsList
        agents={filteredAgents}
        isFetchingAgents={isFetchingAllAgents}
        onRefreshAgent={refetchAgent}
      />
    </div>
  )
}
