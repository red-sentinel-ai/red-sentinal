'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, X } from 'lucide-react'

import { AgentsList } from './AgentsList'
import { useAllAgents, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { useTrendingAgents } from '@/hooks/agents/useTrendingAgents'
import { useAgentCoinTypes } from '@/hooks/agents/useAgentCoinTypes'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TEXT_COPIES } from '@/constants/text_copies'
import { TokenFilterDropdown } from '@/components/agents/TokenFilterDropdown'
import { ChainFilterDropdown } from '@/components/agents/ChainFilterDropdown'
import { type SupportedChain, CHAINS } from '@/constants/chains'
import { getTokenForCoinType } from '@/constants'
import { AttackStats } from '@/components/attack/AttackStats'
import { SentinelMarquee } from '@/components/attack/SentinelMarquee'
import { SentinelRowSkeleton } from '@/components/attack/SentinelRowSkeleton'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

type BountyTab = 'all' | 'big_bounties'

// A sentinel is browsable in a row when it's active and not in a withdrawal
// (attack-paused) window.
function isBrowsable(agent: { state: string; unlock_timestamp?: string | number }) {
  if (agent.state === 'defeated') return false
  const unlockTs = Number(agent.unlock_timestamp)
  const isAttackPaused = unlockTs > 0 && unlockTs <= Date.now()
  return !isAttackPaused
}

export const AgentListView = () => {
  const [activeTab, setActiveTab] = useState<BountyTab>('all')
  const [sortField, setSortField] = useState<SortField>('total_balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>(undefined)
  const [selectedChain, setSelectedChain] = useState<SupportedChain | undefined>(undefined)

  const {
    data: allAgentsData,
    isPending: isFetchingAllAgents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllAgents(sortField, sortDirection, undefined, true, selectedChain)

  const { data: featuredAgents, isPending: isFetchingFeatured } = useFeaturedAgents(true)
  const { data: trendingAgents, isPending: isFetchingTrending } = useTrendingAgents(true)
  const { data: availableTokens = [] } = useAgentCoinTypes()

  // Flatten all pages of agents
  const allAgents = allAgentsData?.pages.flatMap(page => page.agents) || []
  const totalAgents = allAgentsData?.pages[0]?.total ?? 0

  const featuredForRow = (featuredAgents || []).filter(isBrowsable)
  const featuredIds = new Set(featuredForRow.map(a => a.agent_id))

  const trendingForRow = (trendingAgents || [])
    .filter(isBrowsable)
    .filter(a => !featuredIds.has(a.agent_id))

  const filteredAgents = (() => {
    let base =
      activeTab === 'big_bounties'
        ? allAgents.filter(agent => {
            try {
              return BigInt(agent.total_balance) >= BIG_BOUNTY_THRESHOLD_MIST
            } catch {
              return false
            }
          })
        : allAgents
    if (selectedSymbol) {
      base = base.filter(agent => getTokenForCoinType(agent.coin_type).symbol === selectedSymbol)
    }
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

  const selectedToken = availableTokens.find(t => t.symbol === selectedSymbol)

  return (
    <div className="mx-auto max-w-[1560px] px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8 md:mb-12">
        <h1 className="page-heading">Prepare Yourself for Age of Agents</h1>
        <p className="page-subheading mt-2">
          Agents are everywhere. we all need to upskill to make most of this new era. learn by doing.
          Red Sentinel is the ultimate playground to build, defend, and attack with AI agents. Are
          you ready to test your skills and earn rewards in the most exciting way possible?
        </p>
      </div>

      <div className="mb-10 md:mb-14">
        <AttackStats />
      </div>

      {(isFetchingFeatured || featuredForRow.length > 0) && (
        <section className="mb-10 md:mb-14">
          <div className="mb-4 md:mb-6">
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">
              Featured Sentinels
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Curated high-value targets. Bigger pools, proven resilience.
            </p>
          </div>
          {isFetchingFeatured ? (
            <SentinelRowSkeleton />
          ) : (
            <SentinelMarquee agents={featuredForRow} variant="featured" />
          )}
        </section>
      )}

      {/* Trending Sentinels — auto-scrolling row (deduped against Featured) */}
      {(isFetchingTrending || trendingForRow.length > 0) && (
        <section className="mb-10 md:mb-14">
          <div className="mb-4 md:mb-6">
            <h2 className="text-base font-medium text-[var(--color-text-primary)]">
              Trending Sentinels
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              The most-attacked sentinels right now. Where the action is.
            </p>
          </div>
          {isFetchingTrending ? (
            <SentinelRowSkeleton />
          ) : (
            <SentinelMarquee agents={trendingForRow} variant="trending" />
          )}
        </section>
      )}

      <div>
        <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-[var(--color-text-primary)]">
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
            <ChainFilterDropdown selectedChain={selectedChain} onSelect={setSelectedChain} />
            <TokenFilterDropdown
              availableTokens={availableTokens}
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
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

        {(selectedSymbol || selectedChain) && (
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
            {selectedSymbol && selectedToken && (
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
                  onClick={() => setSelectedSymbol(undefined)}
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
      </div>
    </div>
  )
}
