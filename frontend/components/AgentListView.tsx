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
import { cn } from '@/lib/utils'
import { TEXT_COPIES } from '@/constants/text_copies'
import { type SupportedChain, CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { getTokenForCoinType } from '@/constants/tokens'
import { AttackStats } from '@/components/attack/AttackStats'
import { SentinelMarquee } from '@/components/attack/SentinelMarquee'
import { SentinelRowSkeleton } from '@/components/attack/SentinelRowSkeleton'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20 SUI

const MAX_TRENDING_SENTINELS = 8

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
    .slice(0, MAX_TRENDING_SENTINELS)

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
    <div className="px-4 py-8 md:px-12 md:py-12">
      <section className="mx-auto mb-16 max-w-5xl py-8 text-center md:mb-20 md:py-12">
        <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.08] tracking-[0.04em] text-white sm:text-5xl md:text-7xl">
          Prepare Yourself for Age of Agents
        </h1>
        <p className="font-body mx-auto mt-6 max-w-2xl text-sm font-semibold leading-relaxed tracking-[0.08em] text-[var(--color-text-secondary)]">
          Agents are already in our life. Learn how they think, where they break, and how to
          outsmart them by actually doing it.
        </p>
        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row sm:items-center">
          <span className="font-body text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            LIVE ON:
          </span>
          <div className="flex flex-wrap justify-center gap-4">
            {SUPPORTED_CHAINS.map(chainId => {
              const chain = CHAINS[chainId]
              const active = selectedChain === chainId
              return (
                <button
                  type="button"
                  key={chainId}
                  onClick={() => setSelectedChain(active ? undefined : chainId)}
                  className={`font-body inline-flex items-center gap-2 border px-5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? 'border-white bg-white text-black'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-white hover:text-white'
                  }`}
                >
                  <Image
                    src={chain.icon}
                    alt=""
                    width={14}
                    height={14}
                    className={cn('rounded-full', active ? 'brightness-0' : chain.iconFilterClass)}
                  />
                  {chain.name}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats are hidden in Arbitrum-only mode. */}
      <div className="mb-16 md:mb-20">
        <AttackStats />
      </div>

      {(isFetchingFeatured || featuredForRow.length > 0) && (
        <section className="mb-16 md:mb-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
                Featured Sentinels
              </h2>
              <p className="font-body mt-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70">
                Curated high-value targets. Bigger pools, proven resilience.
              </p>
            </div>
            <a
              href="#active-sentinels"
              className="font-body hidden items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white hover:underline sm:inline-flex"
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
        <section className="mb-16 md:mb-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
                Trending Sentinels
              </h2>
              <p className="font-body mt-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70">
                The most-attacked sentinels right now. Where the action is.
              </p>
            </div>
            <a
              href="#active-sentinels"
              className="font-body hidden items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white hover:underline sm:inline-flex"
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
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white">
                All Sentinels
              </h2>
              <p className="font-body mt-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70">
                Every active target, ranked and sortable. Find your edge.
              </p>
            </div>
            {!isFetchingAllAgents && totalAgents > 0 && (
              <span className="font-body border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
                Showing {filteredAgents.length} of {totalAgents}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-0 border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
            <label className="relative min-w-[240px] flex-1">
              <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[var(--color-text-muted)]" />
              <span className="sr-only">Search agents</span>
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="font-body h-12 w-full border-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-12 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white transition-all placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="SEARCH AGENTS..."
                type="search"
              />
            </label>

            <label className="relative flex h-12 min-w-[170px] items-center border-r border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4">
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
                className="font-body flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white focus:outline-none focus:ring-0"
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

            <label className="relative flex h-12 min-w-[150px] items-center border-r border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4">
              <Coins className="mr-2 size-[18px] text-[var(--color-text-muted)]" />
              <span className="sr-only">Token</span>
              <select
                value={selectedSymbol ?? 'all'}
                onChange={event =>
                  setSelectedSymbol(event.target.value === 'all' ? undefined : event.target.value)
                }
                className="font-body flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white focus:outline-none focus:ring-0"
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

            <label className="relative flex h-12 min-w-[180px] items-center bg-[var(--color-bg-base)] px-4">
              <SlidersHorizontal className="mr-2 size-[18px] text-[var(--color-text-muted)]" />
              <span className="sr-only">Pool filter</span>
              <select
                value={activeTab}
                onChange={event => setActiveTab(event.target.value as BountyTab)}
                className="font-body flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 pr-5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white focus:outline-none focus:ring-0"
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
            <span className="font-body text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
              Filtered by:
            </span>
            {searchQuery.trim() && (
              <span className="font-body flex items-center gap-1.5 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
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
              <span className="font-body flex items-center gap-1.5 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                <Image
                  src={CHAINS[selectedChain].icon}
                  alt={CHAINS[selectedChain].name}
                  width={14}
                  height={14}
                  className={cn('rounded-full', CHAINS[selectedChain].iconFilterClass)}
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
              <span className="font-body flex items-center gap-1.5 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
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
              className="font-body min-w-[200px] rounded-full border-white bg-[var(--color-bg-base)] text-[11px] font-extrabold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-black"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        <p className="font-body mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {TEXT_COPIES.LOW_POOL_BALANCE_HIDDEN_MESSAGE}
        </p>
      </div>
    </div>
  )
}
