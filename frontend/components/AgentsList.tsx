'use client'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, Flame } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { Badge } from '@/components/ui'
import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { getTokenForCoinType } from '@/constants'
import { CHAINS } from '@/constants/chains'
import { PrizePoolChangeDisplay } from './agents/PrizePoolChangeDisplay'
import { TokenAmount } from './ui/common/TokenAmount'
import Image from 'next/image'

export enum TabType {
  AgentRanking = 'AGENT_RANKING',
  ActiveAgents = 'ACTIVE_AGENTS',
  TopAttackers = 'TOP_ATTACKERS',
}

interface AgentsListProps {
  agents: AgentDetails[]
  isFetchingAgents: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export const AgentsList = ({
  agents,
  isFetchingAgents,
  sortField,
  sortDirection,
  onSort,
}: AgentsListProps) => {
  const router = useRouter()

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowDown className="ml-1 h-4 w-4 opacity-30" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key={isFetchingAgents ? 'loading' : 'content'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {isFetchingAgents ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="mb-2 hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-deepest)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] shadow-[var(--shadow-card)] md:grid md:gap-4 md:[grid-template-columns:repeat(13,minmax(0,1fr))]">
              <div className="col-span-1 flex items-center">
                <span>#</span>
              </div>
              <div
                className="col-span-1 flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('agent_id')}
              >
                <span>ID</span>
                <SortIcon field="agent_id" />
              </div>
              <div className="col-span-1 flex items-center">Chain</div>
              <div className="col-span-2 flex items-center">Sentinel</div>
              <div
                className="col-span-2 flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('total_balance')}
              >
                <span>Bounty Pool</span>
                <SortIcon field="total_balance" />
              </div>
              <div
                className="col-span-2 flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('cost_per_message')}
              >
                <span>Cost per Attack</span>
                <SortIcon field="cost_per_message" />
              </div>
              <div
                className="col-span-1 flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('total_attacks')}
              >
                <span>Attacks</span>
                <SortIcon field="total_attacks" />
              </div>
              <div
                className="col-span-1 flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('change7d')}
              >
                <span>7d Activity</span>
                <SortIcon field="change7d" />
              </div>
              <div className="col-span-1 flex items-center justify-end">Status</div>
              <div className="col-span-1 flex items-center justify-end">Actions</div>
            </div>

            <AnimatePresence mode="popLayout">
              {agents.map((agent, idx) => {
                const agentToken = getTokenForCoinType(agent.coin_type)
                const chainData = CHAINS[agent.chain as keyof typeof CHAINS] ?? CHAINS.sui

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="cursor-pointer rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3 text-sm shadow-[var(--shadow-card)] hover:border-[var(--color-border-default)]"
                    onClick={() => router.push(`/attack/${agent.agent_path}`)}
                  >
                    <div className="space-y-3 md:hidden">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex flex-1 items-center gap-2">
                          <span className="shrink-0">#{idx + 1}</span>
                          <span className="min-w-0 flex-1 truncate">{agent.agent_name}</span>
                          {agent.is_featured && (
                            <Image
                              src="/icons/check-mark.svg"
                              width={14}
                              height={14}
                              alt="checkmark"
                              className="shrink-0"
                            />
                          )}
                          {agent.trending && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-400/30 bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-400">
                              <Flame className="h-2.5 w-2.5 shrink-0" />
                              {agent.trending_window === '24h' || !agent.trending_window
                                ? 'Trending'
                                : `Trending ${agent.trending_window}`}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant={agent.state === 'active' ? 'secondary' : 'destructive'}
                          className={`${
                            agent.state === 'active'
                              ? 'border-[#1FAD57]/40 bg-[#1FAD57]/10 text-[#1FAD57]'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                          } rounded-xl text-xs`}
                        >
                          {agent.state === 'active' ? (
                            <Image
                              src="/icons/shield-green.png"
                              width={14}
                              height={14}
                              alt="shield green"
                              className="mr-1"
                            />
                          ) : (
                            <Image
                              src="/icons/shield-red.png"
                              width={14}
                              height={14}
                              alt="shield red"
                              className="mr-1"
                            />
                          )}
                          {agent.state === 'active' ? 'Active' : 'Defeated'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Reward</p>
                          <p className="text-sm"><TokenAmount rawAmount={agent.total_balance} token={agentToken} precision={2} /></p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Message Price</p>
                          <p className="text-sm"><TokenAmount rawAmount={agent.cost_per_message} token={agentToken} precision={2} /></p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Attacks</p>
                          <p>{agent.total_attacks || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Chain</p>
                          <div className="flex items-center gap-1">
                            <Image
                              src={chainData.icon}
                              alt={chainData.name}
                              width={14}
                              height={14}
                              className="rounded-full"
                            />
                            <p>{chainData.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden items-center md:grid md:gap-4 md:[grid-template-columns:repeat(13,minmax(0,1fr))]">
                      <div className="col-span-1 flex items-center">
                        <span>{idx + 1}</span>
                      </div>
                      <div className="col-span-1 flex items-center">{agent.agent_id}</div>
                      <div className="col-span-1 flex items-center gap-1.5">
                        <Image
                          src={chainData.icon}
                          alt={chainData.name}
                          width={16}
                          height={16}
                          className="shrink-0 rounded-full"
                        />
                        <span className="text-sm">{chainData.name}</span>
                      </div>

                      <div className="col-span-2 flex min-w-0 items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate">{agent.agent_name}</span>
                        {agent.is_featured && (
                          <Image
                            src="/icons/check-mark.svg"
                            width={20}
                            height={20}
                            alt="checkmark"
                            className="shrink-0"
                          />
                        )}
                        {agent.trending && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-400/30 bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-medium leading-none text-amber-400">
                            <Flame className="h-2.5 w-2.5 shrink-0" />
                            {agent.trending_window === '24h' || !agent.trending_window
                              ? 'Trending'
                              : `Trending ${agent.trending_window}`}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center"><TokenAmount rawAmount={agent.total_balance} token={agentToken} precision={2} /></div>
                      <div className="col-span-2 flex items-center"><TokenAmount rawAmount={agent.cost_per_message} token={agentToken} precision={2} /></div>
                      <div className="col-span-1 flex items-center">{agent.total_attacks || 0}</div>

                      <div className="col-span-1 flex items-center">
                        <PrizePoolChangeDisplay
                          prizePoolHistory={agent.prizePoolHistory}
                          variant="list"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                        <Badge
                          variant={agent.state === 'active' ? 'secondary' : 'destructive'}
                          className={`${
                            agent.state === 'active'
                              ? 'border-[#1FAD57]/40 bg-[#1FAD57]/10 text-[#1FAD57]'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                          } rounded-xl text-sm`}
                        >
                          {agent.state === 'active' ? (
                            <Image
                              src="/icons/shield-green.png"
                              width={14}
                              height={14}
                              alt="shield green"
                              className="mr-1"
                            />
                          ) : (
                            <Image
                              src="/icons/shield-red.png"
                              width={14}
                              height={14}
                              alt="shield red"
                              className="mr-1"
                            />
                          )}
                          {agent.state === 'active' ? 'Active' : 'Defeated'}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => router.push(`/attack/${agent.agent_path}`)}
                          className="badge-black text-sm"
                        >
                          <Image
                            src="/icons/swords-white.png"
                            width="14"
                            height="14"
                            alt="swords"
                            className="mr-1"
                          />
                          Attack
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
