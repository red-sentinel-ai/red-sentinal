'use client'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { LeaderboardSkeleton } from './ui/skeletons/LeaderboardSkeleton'
import { AgentDetails, SortField, SortDirection } from '@/hooks/agents/useAllAgents'
import { getTokenForCoinType } from '@/constants'
import { CHAINS } from '@/constants/chains'
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

  const formatSerial = (value?: string | number | null) => {
    if (!value) return 'UNKNOWN'
    const serial = String(value)
    if (serial.length <= 12) return serial
    return `${serial.slice(0, 6)}...${serial.slice(-3)}`
  }

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
          <div className="overflow-x-auto overflow-y-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
            <div className="font-body hidden min-w-[980px] border-b border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-8 py-5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] md:grid md:gap-4 md:[grid-template-columns:minmax(260px,2.4fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(130px,1fr)_minmax(105px,0.85fr)_minmax(150px,1.2fr)_minmax(96px,0.8fr)]">
              <div
                className="flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('agent_id')}
              >
                <span>ID / Agent Name</span>
                <SortIcon field="agent_id" />
              </div>
              <div className="flex items-center">Status</div>
              <div className="flex items-center">Network</div>
              <div
                className="flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('cost_per_message')}
              >
                <span>Attack Fee</span>
                <SortIcon field="cost_per_message" />
              </div>
              <div
                className="flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('total_attacks')}
              >
                <span>Attacks</span>
                <SortIcon field="total_attacks" />
              </div>
              <div
                className="flex cursor-pointer items-center hover:text-[var(--color-text-primary)]"
                onClick={() => onSort('total_balance')}
              >
                <span>Reward Pool</span>
                <SortIcon field="total_balance" />
              </div>
              <div className="flex items-center justify-end">Action</div>
            </div>

            <AnimatePresence mode="popLayout">
              {agents.length === 0 && (
                <div className="font-body px-4 py-10 text-center text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  No sentinels match current filters
                </div>
              )}
              {agents.map((agent, idx) => {
                const agentToken = getTokenForCoinType(agent.coin_type)
                const chainData = CHAINS[agent.chain as keyof typeof CHAINS] ?? CHAINS.sui
                const isActive = agent.state === 'active'

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="font-body cursor-pointer border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4 text-sm transition-colors last:border-b-0 hover:bg-white/[0.04] md:px-8 md:py-6"
                    onClick={() => router.push(`/attack/${agent.agent_path}`)}
                  >
                    <div className="space-y-3 md:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
                            {agent.agent_image ? (
                              <Image
                                src={agent.agent_image}
                                alt={`${agent.agent_name ?? 'Sentinel'} profile`}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <span className="font-display text-sm font-bold text-[var(--color-text-muted)]">
                                {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
                              </span>
                            )}
                          </span>
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <span className="min-w-0 truncate font-bold uppercase text-[var(--color-text-primary)]">
                              {agent.agent_name}
                            </span>
                            <Image
                              src={chainData.icon}
                              alt={chainData.name}
                              width={13}
                              height={13}
                              className={`shrink-0 rounded-full ${chainData.iconFilterClass}`}
                            />
                          </div>
                          {agent.is_featured && (
                            <Image
                              src="/icons/check-mark.svg"
                              width={14}
                              height={14}
                              alt="checkmark"
                              className="shrink-0"
                            />
                          )}
                        </div>
                        <button
                          onClick={event => {
                            event.stopPropagation()
                            if (isActive) router.push(`/attack/${agent.agent_path}`)
                          }}
                          disabled={!isActive}
                          className={`font-body rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
                            isActive
                              ? 'border-white text-white hover:bg-white hover:text-black'
                              : 'cursor-not-allowed border-[var(--color-border-default)] text-[var(--color-text-faint)]'
                          }`}
                        >
                          {isActive ? 'Attack' : 'Locked'}
                        </button>
                      </div>
                      <p className="font-body pl-10 text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                        SERIAL: {formatSerial(agent.agent_object_id || agent.agent_id)}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs uppercase text-[var(--color-text-muted)]">
                            Attack Fee
                          </p>
                          <p className="text-sm">
                            <TokenAmount
                              rawAmount={agent.cost_per_message}
                              token={agentToken}
                              precision={2}
                              iconSize={13}
                            />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-[var(--color-text-muted)]">
                            Total Attacks
                          </p>
                          <p>{agent.total_attacks || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-[var(--color-text-muted)]">
                            Reward Pool
                          </p>
                          <p className="text-sm font-bold text-white">
                            <TokenAmount
                              rawAmount={agent.total_balance}
                              token={agentToken}
                              precision={2}
                              iconSize={13}
                            />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-[var(--color-text-muted)]">Status</p>
                          <div
                            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${
                              isActive ? 'text-white' : 'text-[var(--color-danger)]'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? 'animate-pulse bg-white' : 'bg-[var(--color-danger)]'
                              }`}
                            />
                            {isActive ? 'Active Breaches' : 'Offline'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-[980px] items-center md:grid md:gap-4 md:[grid-template-columns:minmax(260px,2.4fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(130px,1fr)_minmax(105px,0.85fr)_minmax(150px,1.2fr)_minmax(96px,0.8fr)]">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
                          {agent.agent_image ? (
                            <Image
                              src={agent.agent_image}
                              alt={`${agent.agent_name ?? 'Sentinel'} profile`}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="font-display text-sm font-extrabold text-[var(--color-text-muted)]">
                              {agent.agent_name?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`truncate font-bold uppercase ${
                                idx === 0 ? 'text-white' : 'text-[var(--color-text-primary)]'
                              }`}
                            >
                              {agent.agent_name}
                            </span>
                            <Image
                              src={chainData.icon}
                              alt={chainData.name}
                              width={14}
                              height={14}
                              className={`shrink-0 rounded-full grayscale ${chainData.iconFilterClass}`}
                            />
                            {agent.is_featured && (
                              <Image
                                src="/icons/check-mark.svg"
                                width={14}
                                height={14}
                                alt="checkmark"
                                className="shrink-0"
                              />
                            )}
                          </div>
                          <span className="font-body text-[8px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
                            SERIAL: {formatSerial(agent.agent_object_id || agent.agent_id)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`inline-flex w-fit items-center border px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.1em] ${
                          isActive
                            ? 'border-white/40 text-white'
                            : 'border-white/20 text-[var(--color-text-muted)]'
                        }`}
                      >
                        {isActive ? 'Active' : 'Locked'}
                      </div>
                      <div className="font-body text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
                        {chainData.name}
                      </div>
                      <div className="flex items-center text-[var(--color-text-primary)]">
                        <TokenAmount
                          rawAmount={agent.cost_per_message}
                          token={agentToken}
                          precision={2}
                          iconSize={13}
                        />
                      </div>
                      <div className="flex items-center text-[var(--color-text-secondary)]">
                        {agent.total_attacks || 0}
                      </div>
                      <div className="flex items-center font-extrabold text-white">
                        <TokenAmount
                          rawAmount={agent.total_balance}
                          token={agentToken}
                          precision={2}
                          iconSize={13}
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={event => {
                            event.stopPropagation()
                            if (isActive) router.push(`/attack/${agent.agent_path}`)
                          }}
                          disabled={!isActive}
                          className={`font-body inline-flex items-center gap-1 rounded-full border px-6 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
                            isActive
                              ? 'border-white bg-transparent text-white hover:bg-white hover:text-black'
                              : 'cursor-not-allowed border-[var(--color-border-default)] text-[var(--color-text-faint)]'
                          }`}
                        >
                          {isActive ? 'Attack' : 'Locked'}
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
