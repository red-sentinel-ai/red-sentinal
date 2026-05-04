'use client'

import { useState } from 'react'
import { AgentsList } from './AgentsList'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Loader2, X } from 'lucide-react'

import { FeaturedAgentCard } from './FeaturedAgentCard'
import { FeaturedAgentsSkeleton } from './ui/skeletons/FeaturedAgentsSkeleton'
import { useAllAgents, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { useAgentCoinTypes } from '@/hooks/agents/useAgentCoinTypes'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TEXT_COPIES } from '@/constants/text_copies'
import { useFundAgentModal } from '@/hooks/useFundAgentModal'
import { useWithdrawAgentModal } from '@/hooks/agents/useWithdrawAgentModal'
import { useFeatureAgentModal } from '@/hooks/useFeatureAgentModal'
import { TokenFilterDropdown } from '@/components/agents/TokenFilterDropdown'
import { ChainFilterDropdown } from '@/components/agents/ChainFilterDropdown'
import { type SupportedChain, CHAINS } from '@/constants/chains'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

type BountyTab = 'all' | 'big_bounties'

export const AgentListView = () => {
  const [activeTab, setActiveTab] = useState<BountyTab>('all')
  const [sortField, setSortField] = useState<SortField>('total_balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedCoinType, setSelectedCoinType] = useState<string | undefined>(undefined)
  const [selectedChain, setSelectedChain] = useState<SupportedChain | undefined>(undefined)

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
  } = useAllAgents(sortField, sortDirection, selectedCoinType, true, selectedChain)

  const { data: featuredAgents, isPending: isFetchingFeaturedAgents } = useFeaturedAgents(true)
  const { data: availableTokens = [] } = useAgentCoinTypes()

  // Flatten all pages of agents
  const allAgents = allAgentsData?.pages.flatMap(page => page.agents) || []
  const totalAgents = allAgentsData?.pages[0]?.total ?? 0

  const activeFeaturedAgents = [...(featuredAgents?.filter(agent => agent.state !== 'defeated') || [])].sort(
    (a, b) => {
      if (a.chain === 'solana' && b.chain !== 'solana') return -1
      if (a.chain !== 'solana' && b.chain === 'solana') return 1
      return 0
    },
  )

  const filteredAgents = (() => {
    const base =
      activeTab === 'big_bounties'
        ? allAgents.filter(agent => {
            try {
              return BigInt(agent.total_balance) >= BIG_BOUNTY_THRESHOLD_MIST
            } catch {
              return false
            }
          })
        : allAgents
    return [...base].sort((a, b) => {
      if (a.chain === 'solana' && b.chain !== 'solana') return -1
      if (a.chain !== 'solana' && b.chain === 'solana') return 1
      return 0
    })
  })()

  const bigBountiesCount = allAgents.filter(agent => {
    try {
      return BigInt(agent.total_balance) >= BIG_BOUNTY_THRESHOLD_MIST
    } catch {
      return false
    }
  }).length

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const selectedToken = availableTokens.find(t => t.coinType === selectedCoinType)

  return (
    <div className="mx-auto max-w-[1560px] px-2 py-4 md:px-8 md:py-16">
      <div className="mb-4 md:mb-20">
        <h1
          className="font-display hidden text-center text-2xl font-bold text-[var(--color-text-primary)] sm:text-4xl md:block md:text-5xl"
          id="leaderboard"
        >
          Enter the Arena
        </h1>
        <div className="mx-auto my-3 flex max-w-[800px] md:my-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--color-border-subtle)]"></div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--color-border-subtle)]"></div>
        </div>
        <p className="font-body mx-auto hidden max-w-[650px] px-4 text-center text-base text-[var(--color-text-secondary)] sm:text-xl md:block">
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
                <h2 className="font-display mb-2 text-xl font-medium text-[var(--color-text-primary)] md:text-3xl">
                  Featured Sentinels
                </h2>
                <p className="font-body text-sm text-[var(--color-text-secondary)] md:text-base">
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
        <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-medium text-[var(--color-text-primary)] md:text-3xl">
                All Sentinels
              </h2>
              {!isFetchingAllAgents && totalAgents > 0 && (
                <span className="font-body rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)] md:text-sm">
                  {totalAgents}
                </span>
              )}
            </div>
            <p className="font-body mt-0.5 text-xs text-[var(--color-text-secondary)] md:mt-1 md:text-sm">
              Every active target, ranked and sortable. Find your edge.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ChainFilterDropdown
              selectedChain={selectedChain}
              onSelect={setSelectedChain}
            />
            <TokenFilterDropdown
              availableTokens={availableTokens}
              selectedCoinType={selectedCoinType}
              onSelect={setSelectedCoinType}
            />

            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as BountyTab)}>
              <TabsList className="h-auto rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-[2px]">
                <TabsTrigger
                  value="big_bounties"
                  className="font-body rounded-md border-b-0 py-1 text-[var(--color-text-secondary)] data-[state=active]:border-b-0 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm sm:px-4"
                >
                  Big Bounties
                  {bigBountiesCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-[var(--color-gold-muted)] px-1.5 py-0.5 text-xs font-medium leading-none text-[var(--color-gold-primary)]">
                      {bigBountiesCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="font-body rounded-md border-b-0 py-1 text-[var(--color-text-secondary)] data-[state=active]:border-b-0 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm sm:px-4"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {(selectedCoinType || selectedChain) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-body text-xs text-[var(--color-text-muted)]">Filtered by:</span>
          {selectedChain && (
            <span className="font-body flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-primary)]">
              <Image
                src={CHAINS[selectedChain].icon}
                alt={CHAINS[selectedChain].name}
                width={14}
                height={14}
                className="rounded-full"
              />
              {CHAINS[selectedChain].name}
              <button
                onClick={() => setSelectedChain(undefined)}
                className="ml-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCoinType && selectedToken && (
            <span className="font-body flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-primary)]">
              <Image
                src={selectedToken.icon}
                alt={selectedToken.symbol}
                width={14}
                height={14}
                className="rounded-full"
              />
              {selectedToken.symbol}
              <button
                onClick={() => setSelectedCoinType(undefined)}
                className="ml-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

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
            className="font-body min-w-[200px] border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
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

      <p className="font-body mt-4 text-xs text-[var(--color-text-muted)]">
        {TEXT_COPIES.LOW_POOL_BALANCE_HIDDEN_MESSAGE}
      </p>

      {/* Single instance of modals - prevents duplicate hook calls */}
      <FundModal onSuccess={() => console.log('Funded successfully!')} />
      <WithdrawModal onSuccess={() => console.log('Withdrew successfully!')} />
      <FeatureModal />
    </div>
  )
}
