'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Coins, Loader2, Network, Search, SlidersHorizontal, X } from 'lucide-react'

import { AgentsList } from './AgentsList'
import { useAllAgents, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { useTrendingAgents } from '@/hooks/agents/useTrendingAgents'
import { useAgentCoinTypes } from '@/hooks/agents/useAgentCoinTypes'
import { Button } from '@/components/ui/button'
import { TEXT_COPIES } from '@/constants/text_copies'
import { type SupportedChain, CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { getTokenForCoinType } from '@/constants'
import { AttackStats } from '@/components/attack/AttackStats'
import { SentinelMarquee } from '@/components/attack/SentinelMarquee'
import { SentinelRowSkeleton } from '@/components/attack/SentinelRowSkeleton'
import { AnimatePresence, motion } from 'framer-motion'
import { ChainLogos } from './ui/common/ChainLogos'

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
  const [searchQuery, setSearchQuery] = useState('')

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
    const normalizedSearch = searchQuery.trim().toLowerCase()
    if (normalizedSearch) {
      base = base.filter(agent => {
        const searchable = [
          agent.agent_name,
          agent.agent_id,
          agent.agent_path,
          agent.agent_object_id,
          agent.creator,
          agent.chain,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return searchable.includes(normalizedSearch)
      })
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
    <div className="mx-auto max-w-[1480px] px-4 py-6 md:px-8 md:py-8">
      <div className="relative mb-10 overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-bg-deepest)] px-4 py-10 text-center md:mb-12 md:px-8 md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,176,0,0.10),transparent_42%)]" />
        <div className="relative">
          <h1 className="page-heading text-center">Prepare Yourself for Age of Agents</h1>
          <p className="page-subheading mx-auto mt-4 max-w-3xl text-center">
            Agents are already in our life. Learn how they think, where they break, and how to
            outsmart them by actually doing it.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              className="mt-7 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ChainLogos />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-10 md:mb-12">
        <AttackStats />
      </div>

      {(isFetchingFeatured || featuredForRow.length > 0) && (
        <section className="mb-10 md:mb-12">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                Featured Sentinels
              </h2>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">
                Curated high-value targets. Bigger pools, proven resilience.
              </p>
            </div>
            <a
              href="#active-sentinels"
              className="hidden items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-gold-light)] hover:text-[var(--color-gold-primary)] sm:inline-flex"
            >
              View all <ArrowRight className="size-3.5" />
            </a>
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
        <section className="mb-10 md:mb-12">
          <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                Trending Sentinels
              </h2>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">
                The most-attacked sentinels right now. Where the action is.
              </p>
            </div>
            <a
              href="#active-sentinels"
              className="hidden items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-gold-light)] hover:text-[var(--color-gold-primary)] sm:inline-flex"
            >
              View all <ArrowRight className="size-3.5" />
            </a>
          </div>
          {isFetchingTrending ? (
            <SentinelRowSkeleton />
          ) : (
            <SentinelMarquee agents={trendingForRow} variant="trending" />
          )}
        </section>
      )}

      <div id="active-sentinels" className="scroll-mt-20">
        <div className="mb-6 flex flex-col">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
                Global Terminal - Active Sentinels
              </h2>
              <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                Every active target, ranked and sortable. Find your edge.
              </p>
            </div>
            {!isFetchingAllAgents && totalAgents > 0 && (
              <span className="border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                Showing {filteredAgents.length} of {totalAgents}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-2">
            <label className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[var(--color-text-muted)]" />
              <span className="sr-only">Search agents</span>
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="w-full border border-[rgba(159,142,120,0.3)] bg-black px-10 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-gold-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-primary)]"
                placeholder="SEARCH AGENTS..."
                type="search"
              />
            </label>

            <label className="relative flex min-w-[170px] items-center border border-[rgba(159,142,120,0.3)] bg-black px-3 py-2">
              <Network className="mr-2 size-[18px] text-[var(--color-text-muted)]" />
              <span className="sr-only">Network</span>
              <select
                value={selectedChain ?? 'all'}
                onChange={event =>
                  setSelectedChain(
                    event.target.value === 'all'
                      ? undefined
                      : (event.target.value as SupportedChain)
                  )
                }
                className="flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)] focus:outline-none focus:ring-0"
              >
                <option value="all">All Networks</option>
                {SUPPORTED_CHAINS.map(chainId => (
                  <option key={chainId} value={chainId}>
                    {CHAINS[chainId].name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 text-[var(--color-text-muted)]">
                v
              </span>
            </label>

            <label className="relative flex min-w-[150px] items-center border border-[rgba(159,142,120,0.3)] bg-black px-3 py-2">
              <Coins className="mr-2 size-[18px] text-[var(--color-text-muted)]" />
              <span className="sr-only">Token</span>
              <select
                value={selectedSymbol ?? 'all'}
                onChange={event =>
                  setSelectedSymbol(event.target.value === 'all' ? undefined : event.target.value)
                }
                className="flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)] focus:outline-none focus:ring-0"
              >
                <option value="all">All Tokens</option>
                {availableTokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 text-[var(--color-text-muted)]">
                v
              </span>
            </label>

            <label className="relative flex min-w-[170px] items-center border border-[rgba(159,142,120,0.3)] bg-black px-3 py-2">
              <SlidersHorizontal className="mr-2 size-[18px] text-[var(--color-text-muted)]" />
              <span className="sr-only">Pool filter</span>
              <select
                value={activeTab}
                onChange={event => setActiveTab(event.target.value as BountyTab)}
                className="flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-primary)] focus:outline-none focus:ring-0"
              >
                <option value="all">All Sentinels</option>
                <option value="big_bounties">Big Bounties ({bigBountiesCount})</option>
              </select>
              <span className="pointer-events-none absolute right-3 text-[var(--color-text-muted)]">
                v
              </span>
            </label>
          </div>
        </div>

        {(selectedSymbol || selectedChain || searchQuery.trim()) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-body text-xs text-[var(--color-text-muted)]">Filtered by:</span>
            {searchQuery.trim() && (
              <span className="font-body flex items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-primary)]">
                Search: {searchQuery.trim()}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
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
