'use client'

import { useState } from 'react'
import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { useAllAgents, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TEXT_COPIES } from '@/constants/text_copies'
import { Loader2 } from 'lucide-react'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

type BountyTab = 'all' | 'big_bounties'

export const AgentListView = () => {
  const [activeTab, setActiveTab] = useState<BountyTab>('all')
  const [sortField, setSortField] = useState<SortField>('total_balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Single instance of modals at parent level to avoid duplicate hook calls
  const { Modal: FundModal, openModal: openFundModal } = useFundAgentModal()
  const { Modal: WithdrawModal, openModal: openWithdrawModal } = useWithdrawAgentModal()
  const { Modal: FeatureModal, openModal: openFeatureModal } = useFeatureAgentModal()
  
  const {
    data: allAgentsData,
    isPending: isFetchingAllAgents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllAgents(sortField, sortDirection)
  
  const { data: featuredAgents, isPending: isFetchingFeaturedAgents } = useFeaturedAgents()

  // Flatten all pages of agents
  const allAgents = allAgentsData?.pages.flatMap(page => page.agents) || []

  const activeFeaturedAgents =
    featuredAgents?.filter(agent => agent.state !== 'defeated') || []

  const filteredAgents =
    activeTab === 'big_bounties'
      ? allAgents?.filter(agent => {
          try {
            return BigInt(agent.total_balance) >= BIG_BOUNTY_THRESHOLD_MIST
          } catch {
            return false
          }
        })
      : allAgents

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

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

      {isFetchingFeaturedAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {activeFeaturedAgents?.length > 0 && (
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
                  {activeFeaturedAgents.map((agent, index) => (
                    <FeaturedAgentCard
                      key={agent.agent_id}
                      agent={agent}
                      index={index}
                      ctaHeading="Attack Sentinel"
                      onFund={openFundModal}
                      onWithdraw={openWithdrawModal}
                      onFeature={openFeatureModal}
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
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      
      {/* Load More Button */}
      {hasNextPage && !isFetchingAllAgents && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
      
      <p className="mt-4 text-xs text-[#5E5E5E]">{TEXT_COPIES.LOW_POOL_BALANCE_HIDDEN_MESSAGE}</p>
      
      {/* Single instance of modals - prevents duplicate hook calls */}
      <FundModal onSuccess={() => console.log('Funded successfully!')} />
      <WithdrawModal onSuccess={() => console.log('Withdrew successfully!')} />
      <FeatureModal />
    </div>
  )
}
