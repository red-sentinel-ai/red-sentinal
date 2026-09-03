'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  Coins,
  Loader2,
  Network,
  Search,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { AgentsList } from './AgentsList'
import { FilterSelect, type FilterSelectOption } from '@/components/attack/FilterSelect'
import { useAllAgents } from '@/hooks/agents/useAllAgents'
import type { SortField, SortDirection } from '@/types/agents'
import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { useTrendingAgents, MAX_TRENDING_SENTINELS } from '@/hooks/agents/useTrendingAgents'
import { useAgentCoinTypes } from '@/hooks/agents/useAgentCoinTypes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TEXT_COPIES } from '@/constants/text_copies'
import { type SupportedChain, CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { getTokenForCoinType } from '@/constants/tokens'
import {
  isSentinelAttackable,
  SENTINEL_STATUS_FILTER_OPTIONS,
  SENTINEL_STATUS_META,
  type SentinelStatusFilter,
} from '@/lib/sentinel-status'
// import { AttackStats } from '@/components/attack/AttackStats'
import { SentinelMarquee } from '@/components/attack/SentinelMarquee'
import { SentinelRowSkeleton } from '@/components/attack/SentinelRowSkeleton'

const BIG_BOUNTY_THRESHOLD_MIST = BigInt(20_000_000_000) // 20

type BountyTab = 'all' | 'big_bounties'

const ALL_FILTER_VALUE = 'all'

const NETWORK_FILTER_OPTIONS: FilterSelectOption[] = [
  { value: ALL_FILTER_VALUE, label: 'All Networks' },
  ...SUPPORTED_CHAINS.map(chainId => ({
    value: chainId,
    label: CHAINS[chainId].name,
    iconSrc: CHAINS[chainId].icon,
    iconClassName: CHAINS[chainId].iconFilterClass,
  })),
]

export const AgentListView = () => {
  const [activeTab, setActiveTab] = useState<BountyTab>('all')
  const [sortField, setSortField] = useState<SortField>('total_balance')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>(undefined)
  const [selectedChain, setSelectedChain] = useState<SupportedChain | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<SentinelStatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: allAgentsData,
    isPending: isFetchingAllAgents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllAgents({ sortField, sortDirection, chain: selectedChain, status: selectedStatus })

  const { data: featuredAgents, isPending: isFetchingFeatured } = useFeaturedAgents(true)
  const { data: trendingAgents, isPending: isFetchingTrending } = useTrendingAgents(true)
  const { data: availableTokens = [] } = useAgentCoinTypes()

  // Flatten all pages of agents
  const allAgents = allAgentsData?.pages.flatMap(page => page.agents) || []
  const totalAgents = allAgentsData?.pages[0]?.total ?? 0

  const featuredForRow = (featuredAgents || []).filter(isSentinelAttackable)
  const featuredIds = new Set(featuredForRow.map(a => a.agent_id))

  const trendingForRow = (trendingAgents || [])
    .filter(isSentinelAttackable)
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
      base = base.filter(
        agent => getTokenForCoinType(agent.coin_type, agent.chain).symbol === selectedSymbol
      )
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
    return base
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

  const tokenOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: 'All Tokens' },
      ...availableTokens.map(token => ({
        value: token.symbol,
        label: token.symbol,
        iconSrc: token.icon,
      })),
    ],
    [availableTokens]
  )

  const poolOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: 'All Sentinels' },
      { value: 'big_bounties', label: `Big Bounties (${bigBountiesCount})` },
    ],
    [bigBountiesCount]
  )

  return (
    <div className="px-3 py-6 md:px-12 md:py-12">
      <section className="mx-auto mb-10 max-w-5xl py-4 text-center md:mb-20 md:py-12">
        <h1 className="font-display text-3xl font-extrabold leading-[1.08] tracking-[0.04em] text-white sm:text-4xl md:text-7xl">
          Break AI Agents. Take the Pool.
        </h1>
        <p className="font-body mx-auto mt-4 max-w-2xl text-[13px] font-semibold leading-relaxed tracking-[0.06em] text-[var(--color-text-secondary)] sm:mt-6 sm:text-sm sm:tracking-[0.08em]">
          Attackers pay to break sentinels and win the entire on-chain bounty. Defenders deploy
          agents and earn from every attack they survive. Skill-gated PvP, no luck, no lottery.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-body text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
            LIVE ON:
          </span>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {SUPPORTED_CHAINS.map(chainId => {
              const chain = CHAINS[chainId]
              const active = selectedChain === chainId
              return (
                <button
                  type="button"
                  key={chainId}
                  onClick={() => setSelectedChain(active ? undefined : chainId)}
                  className={cn(
                    'font-body inline-flex items-center gap-2 border px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] transition-colors sm:px-5 sm:text-[10px]',
                    active
                      ? 'border-white bg-white text-black'
                      : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-white hover:text-white'
                  )}
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
      {/* <div className="mb-10 md:mb-20">
        <AttackStats />
      </div> */}

      {/* Trending Sentinels — auto-scrolling row (deduped against Featured) */}
      {(isFetchingTrending || trendingForRow.length > 0) && (
        <section className="mb-10 md:mb-20">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Trending Sentinels
              </h2>
              <p className="font-body mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70 sm:mt-2 sm:text-[10px]">
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

      {(isFetchingFeatured || featuredForRow.length > 0) && (
        <section className="mb-10 md:mb-20">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Featured Sentinels
              </h2>
              <p className="font-body mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70 sm:mt-2 sm:text-[10px]">
                The biggest pools on the arena. Broken ones paid out. these haven&apos;t. Yet.
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

      <div id="active-sentinels" className="scroll-mt-20">
        <div className="mb-6 flex flex-col">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-8 md:gap-4">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                All Sentinels
              </h2>
              <p className="font-body mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] opacity-70 sm:mt-2 sm:text-[10px]">
                Every active target, ranked and sortable. Find your edge.
              </p>
            </div>
            {!isFetchingAllAgents && totalAgents > 0 && (
              <span className="font-body border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] sm:px-3 sm:text-[10px]">
                Showing {filteredAgents.length} of {totalAgents}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] md:flex md:flex-wrap md:items-center">
            <label className="relative col-span-2 border-b border-[var(--color-border-default)] md:col-span-1 md:min-w-[240px] md:flex-1 md:border-b-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)] md:left-4 md:size-[18px]" />
              <span className="sr-only">Search agents</span>
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="font-body h-11 w-full border-0 bg-[var(--color-bg-base)] px-9 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white transition-all placeholder:text-[var(--color-text-faint)] focus:outline-none focus:ring-1 focus:ring-white md:h-12 md:border-r md:border-[var(--color-border-default)] md:px-12 md:text-[10px]"
                placeholder="SEARCH AGENTS..."
                type="search"
              />
            </label>

            <FilterSelect
              icon={Network}
              label="Network"
              options={NETWORK_FILTER_OPTIONS}
              value={selectedChain ?? ALL_FILTER_VALUE}
              onValueChange={value =>
                setSelectedChain(value === ALL_FILTER_VALUE ? undefined : (value as SupportedChain))
              }
              className="border-b border-r border-[var(--color-border-default)] md:min-w-[170px] md:border-b-0"
            />

            <FilterSelect
              icon={Shield}
              label="Status"
              options={SENTINEL_STATUS_FILTER_OPTIONS}
              value={selectedStatus}
              onValueChange={value => setSelectedStatus(value as SentinelStatusFilter)}
              className="border-b border-[var(--color-border-default)] md:min-w-[150px] md:border-b-0 md:border-r"
            />

            <FilterSelect
              icon={Coins}
              label="Token"
              options={tokenOptions}
              value={selectedSymbol ?? ALL_FILTER_VALUE}
              onValueChange={value =>
                setSelectedSymbol(value === ALL_FILTER_VALUE ? undefined : value)
              }
              className="border-r border-[var(--color-border-default)] md:min-w-[150px]"
            />

            <FilterSelect
              icon={SlidersHorizontal}
              label="Pool filter"
              options={poolOptions}
              value={activeTab}
              onValueChange={value => setActiveTab(value as BountyTab)}
              className="md:min-w-[180px]"
            />
          </div>
        </div>

        {(selectedSymbol || selectedChain || selectedStatus !== 'all' || searchQuery.trim()) && (
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
            {selectedStatus !== 'all' && (
              <span className="font-body flex items-center gap-1.5 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {SENTINEL_STATUS_META[selectedStatus].label}
                <button
                  onClick={() => setSelectedStatus('all')}
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
