'use client'

import { useState } from 'react'
import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { useAllAgents } from '@/hooks/agents/useAllAgents'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TEXT_COPIES } from '@/constants/text_copies'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

type BountyTab = 'all' | 'big_bounties'

export const AgentListView = () => {
  const { data: allAgents, isPending: isFetchingAllAgents, refetch: refetchAgent } = useAllAgents()
  const [activeTab, setActiveTab] = useState<BountyTab>('all')

  const agentsWithBalance = allAgents?.filter(agent => {
    try {
      return BigInt(agent.total_balance) > BigInt(0.1 * 1_000_000_000) // Filter out agents with balance <= 0.1 SUI
    } catch {
      return false
    }
  })

  const featuredAgents =
    agentsWithBalance?.filter(agent => agent.is_featured && agent.state !== 'defeated') || []

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
        <h1
          className="hidden text-center text-2xl font-bold sm:text-4xl md:block md:text-[48px]"
          id="leaderboard"
        >
          Enter the Arena
        </h1>
        <div className="mx-auto my-3 flex max-w-[800px] md:my-4">
          <div className="black-gradient-border hidden md:block"></div>
          <div className="black-gradient-border hidden rotate-180 md:block"></div>
        </div>
        <p className="mx-auto hidden max-w-[650px] px-4 text-center text-base text-[#5E5E5E] sm:text-xl md:block">
          Select a Sentinel, engineer your attack, and claim the bounty. Verified on-chain, paid
          instantly.
        </p>
      </div>

      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {featuredAgents.length > 0 && (
            <div className="mb-8 md:mb-16">
              <div className="mb-4 md:mb-8">
                <h2 className="mb-2 text-xl font-medium md:text-[32px]">Featured Sentinels</h2>
                <p className="text-sm text-[#5E5E5E] md:text-base">
                  Curated high-value targets. Bigger pools, proven resilience. The prestige kills.
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
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
        <div className="mb-3 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-medium md:text-[32px]">All Sentinels</h2>
            <p className="mt-0.5 text-xs text-[#5E5E5E] md:mt-1 md:text-sm">
              Every active target, ranked and sortable. Find your edge.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as BountyTab)}>
            <TabsList className="h-auto rounded-md border border-gray-200 bg-gray-100 p-[2px]">
              <TabsTrigger
                value="big_bounties"
                className="rounded-md border-b-0 py-1 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
              >
                Big Bounties
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="rounded-md border-b-0 py-1 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
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
      <p className="mt-4 text-xs text-[#5E5E5E]">{TEXT_COPIES.LOW_POOL_BALANCE_HIDDEN_MESSAGE}</p>
    </div>
  )
}
