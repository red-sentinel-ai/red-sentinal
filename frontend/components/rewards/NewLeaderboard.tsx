'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Trophy,
  Crown,
  Medal,
  Calculator,
  Share2,
  Search,
  ExternalLink,
  Flame,
  BookOpen,
  Github,
  User,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  REWARD_CALCULATOR_URL,
  SUI_SENTINEL_DOCS_URL,
  SUI_SENTINEL_GITHUB_URL,
  SUI_SENTINEL_AUDIT_REPORT_URL,
  SUI_SENTINEL_APP_URL,
  EXPLORER_BASE_URL,
} from '@/constants'
import { useDefendersLeaderboard, mapApiDefender } from '@/hooks/rewards/useDefendersLeaderboard'
import { useAttackersLeaderboard, mapApiAttacker } from '@/hooks/rewards/useAttackersLeaderboard'
import { truncateAddress } from '@/lib/utils'

export type DefenderTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legendary'
export type AttackerTier = 'Recruit' | 'Hunter' | 'Specialist' | 'Elite' | 'Apex Predator'
export type SortDir = 'asc' | 'desc'

export interface DefenderEntry {
  rank: number
  userId: string
  username: string
  walletAddress: string
  avatarUrl?: string
  compositeScore: number // Weighted composite score (40% TVL, 30% attacks survived, 20% breach rate inverted, 10% active sentinels)
  defenderTier: DefenderTier
  tvlUsd: number // Total Value Locked in USD across all reward pools
  activeSentinels: number // Count of currently live Sentinels
  totalSentinelsDeployed: number // All-time created Sentinels (includes inactive)
  longestSurvivingHours: number // Hours since deployment of longest-standing unbreached Sentinel
  totalAttacksSurvived: number // consume_prompt calls where success=false
  breachRatePct: number // (successful attacks / total attacks) * 100
  totalFeesEarnedUsd: number // Cumulative fees claimed + pending in USD
  sentinelTokensEarned: number // $SENTINEL token rewards distributed
  isCurrentUser?: boolean
}

export interface AttackerEntry {
  rank: number
  userId: string
  username: string
  walletAddress: string
  avatarUrl?: string
  attackerTier: AttackerTier
  totalBountyWonUsd: number // Sum of all reward pool payouts received in USD
  successfulBreaches: number // consume_prompt calls where success=true
  totalAttacksSent: number // All consume_prompt calls by this address
  breachRatePct: number // (successfulBreaches / totalAttacksSent) * 100
  largestSingleBountyUsd: number // Maximum single payout received in USD
  attackStreakDays: number // Consecutive days with at least one attack
  sentinelTokensEarned: number // Token rewards distributed for attacking
  lastActiveTimestamp: string // ISO timestamp of most recent consume_prompt
  isCurrentUser?: boolean
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
  if (n >= 1_000) return `$${(n / 1_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}K`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSurvivalTime(hours: number) {
  const d = Math.floor(hours / 24)
  const h = hours % 24
  if (d === 0) return `${h}h`
  return `${d}d ${h}h`
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function breachRateColor(pct: number) {
  if (pct <= 5) return 'text-emerald-400'
  if (pct <= 10) return 'text-amber-400'
  return 'text-red-400'
}

// ─── Tier Config ─────────────────────────────────────────────────────────────

const DEFENDER_TIER_CONFIG: Record<
  DefenderTier,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  Bronze: {
    bg: 'bg-amber-900/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Bronze',
  },
  Silver: {
    bg: 'bg-slate-700/30',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    label: 'Silver',
  },
  Gold: {
    bg: 'bg-yellow-900/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-500',
    label: 'Gold',
  },
  Diamond: {
    bg: 'bg-cyan-900/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
    label: 'Diamond',
  },
  Legendary: {
    bg: 'bg-purple-900/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-500',
    label: 'Legendary',
  },
}

const ATTACKER_TIER_CONFIG: Record<
  AttackerTier,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  Recruit: {
    bg: 'bg-white/10',
    text: 'text-white/60',
    border: 'border-white/15',
    dot: 'bg-white/40',
    label: 'Recruit',
  },
  Hunter: {
    bg: 'bg-green-900/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    label: 'Hunter',
  },
  Specialist: {
    bg: 'bg-blue-900/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'Specialist',
  },
  Elite: {
    bg: 'bg-orange-900/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
    label: 'Elite',
  },
  'Apex Predator': {
    bg: 'bg-red-900/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    label: 'Apex Predator',
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DefenderTierBadge({ tier }: { tier: DefenderTier }) {
  const cfg = DEFENDER_TIER_CONFIG[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function AttackerTierBadge({ tier }: { tier: AttackerTier }) {
  const cfg = ATTACKER_TIER_CONFIG[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        cfg.bg,
        cfg.text,
        cfg.border
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <Crown className="h-6 w-6 text-yellow-500" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-yellow-500 text-[9px] font-bold text-white">
            1
          </span>
        </div>
      </div>
    )
  if (rank === 2)
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <Trophy className="h-5 w-5 text-slate-400" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-slate-400 text-[9px] font-bold text-white">
            2
          </span>
        </div>
      </div>
    )
  if (rank === 3)
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <Medal className="h-5 w-5 text-amber-700" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)] bg-amber-700 text-[9px] font-bold text-white">
            3
          </span>
        </div>
      </div>
    )
  return (
    <div className="flex items-center justify-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/50">
        {rank}
      </span>
    </div>
  )
}

function IdentityCell({
  username,
  walletAddress,
  avatarUrl,
}: {
  username: string
  walletAddress: string
  avatarUrl?: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/40">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={username} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <Link
          href={`/u/${username}`}
          className="truncate text-sm font-semibold text-white hover:underline"
        >
          {username}
        </Link>
        <Link
          href={`${EXPLORER_BASE_URL}/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-mono text-xs text-white/40 hover:underline"
        >
          {truncateAddress(walletAddress)}
        </Link>
      </div>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="ml-1 h-3 w-3 text-white/30" />
  return dir === 'asc' ? (
    <ArrowUp className="ml-1 h-3 w-3 text-white" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 text-white" />
  )
}

function ColHeader({
  label,
  tooltip,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string
  tooltip?: string
  sortKey: string
  currentSort: string
  currentDir: SortDir
  onSort: (key: string) => void
}) {
  const active = currentSort === sortKey
  return (
    <th
      className="max-w-[100px] cursor-pointer select-none px-1 py-3 text-center text-xs font-semibold tracking-wide text-white/50 hover:text-white"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="h-3 w-3 text-white/30 hover:text-white/60"
                onClick={e => e.stopPropagation()}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-48 text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <SortIcon active={active} dir={currentDir} />
      </div>
    </th>
  )
}

function ShareButton({ rank, tab }: { rank: number; tab: 'defenders' | 'attackers' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${SUI_SENTINEL_APP_URL}/leaderboard?rank=${rank}&tab=${tab}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleShare}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/40 transition-colors hover:border-white/20 hover:text-white"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{copied ? 'Copied!' : 'Copy share link'}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Reward Calculator Banner ─────────────────────────────────────────────────

function RewardCalculatorBanner() {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
          <Calculator className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Estimate your defender earnings</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Use our Reward Calculator to project returns based on pool size and attack volume.
          </p>
        </div>
      </div>
      <Link
        href={REWARD_CALCULATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
      >
        Reward Calculator
        <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Docs Quick-Links ─────────────────────────────────────────────────────────

function DocsQuickLinks() {
  const links = [
    {
      label: 'How Scoring Works',
      href: `${SUI_SENTINEL_DOCS_URL}how-it-works/leaderboard-and-scoring`,
      icon: BookOpen,
    },
    { label: 'Reward Calculator', href: REWARD_CALCULATOR_URL, icon: Calculator },
    { label: 'Audit Report', href: SUI_SENTINEL_AUDIT_REPORT_URL },
    { label: 'Smart Contracts', href: SUI_SENTINEL_GITHUB_URL, icon: Github },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          {Icon && <Icon className="h-3.5 w-3.5 text-white/40" />}
          {label}
          <ExternalLink className="h-2.5 w-2.5 opacity-50" />
        </Link>
      ))}
    </div>
  )
}

// ─── Mobile Defender Card ─────────────────────────────────────────────────────

function DefenderCard({ entry }: { entry: DefenderEntry }) {
  const [expanded, setExpanded] = useState(false)
  const rankColors: Record<number, string> = {
    1: 'border-yellow-500/30 bg-yellow-900/20',
    2: 'border-slate-500/30 bg-slate-800/30',
    3: 'border-amber-500/30 bg-amber-900/20',
  }
  const borderClass = entry.isCurrentUser
    ? 'border-blue-500/30 bg-blue-900/15'
    : rankColors[entry.rank] || 'border-white/10 bg-white/5'

  return (
    <motion.div layout className={cn('rounded-xl border p-4 transition-colors', borderClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <RankCell rank={entry.rank} />
          <IdentityCell
            username={entry.username}
            walletAddress={entry.walletAddress}
            avatarUrl={entry.avatarUrl}
          />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <DefenderTierBadge tier={entry.defenderTier} />
          {entry.isCurrentUser && (
            <span className="rounded-full border border-blue-500/30 bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              You
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Score</p>
          <p className="text-sm font-bold text-white">{entry.compositeScore.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/40">TVL</p>
          <p className="text-sm font-bold text-white">{formatUsd(entry.tvlUsd)}</p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: 'Active Sentinels', value: entry.activeSentinels },
                { label: 'Deployed (all-time)', value: entry.totalSentinelsDeployed },
                {
                  label: 'Longest Surviving',
                  value: formatSurvivalTime(entry.longestSurvivingHours),
                },
                { label: 'Attacks Survived', value: entry.totalAttacksSurvived.toLocaleString() },
                {
                  label: 'Breach Rate',
                  value: `${entry.breachRatePct}%`,
                  colorClass: breachRateColor(entry.breachRatePct),
                },
                { label: 'Fees Earned', value: formatUsd(entry.totalFeesEarnedUsd) },
              ].map(({ label, value, colorClass }) => (
                <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
                  <p className={cn('text-sm font-semibold text-white', colorClass)}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show more
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`${REWARD_CALCULATOR_URL}?poolSize=${entry.tvlUsd}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            <Calculator className="h-3.5 w-3.5" />
            Estimate earnings
          </Link>
          <ShareButton rank={entry.rank} tab="defenders" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile Attacker Card ─────────────────────────────────────────────────────

function AttackerCard({ entry }: { entry: AttackerEntry }) {
  const [expanded, setExpanded] = useState(false)
  const rankColors: Record<number, string> = {
    1: 'border-yellow-500/30 bg-yellow-900/20',
    2: 'border-slate-500/30 bg-slate-800/30',
    3: 'border-amber-500/30 bg-amber-900/20',
  }
  const borderClass = entry.isCurrentUser
    ? 'border-blue-500/30 bg-blue-900/15'
    : rankColors[entry.rank] || 'border-white/10 bg-white/5'

  return (
    <motion.div layout className={cn('rounded-xl border p-4', borderClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <RankCell rank={entry.rank} />
          <IdentityCell
            username={entry.username}
            walletAddress={entry.walletAddress}
            avatarUrl={entry.avatarUrl}
          />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AttackerTierBadge tier={entry.attackerTier} />
          {entry.isCurrentUser && (
            <span className="rounded-full border border-blue-500/30 bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              You
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Bounty Won</p>
          <p className="text-sm font-bold text-white">
            {formatUsd(entry.totalBountyWonUsd)}
          </p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/40">Breaches</p>
          <p className="text-sm font-bold text-white">{entry.successfulBreaches}</p>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: 'Total Attacks', value: entry.totalAttacksSent.toLocaleString() },
                {
                  label: 'Breach Rate',
                  value: `${entry.breachRatePct}%`,
                  colorClass: entry.breachRatePct > 10 ? 'text-emerald-600' : undefined,
                },
                {
                  label: 'Largest Bounty',
                  value: formatUsd(entry.largestSingleBountyUsd),
                },
                {
                  label: 'Attack Streak',
                  value: entry.attackStreakDays > 0 ? `🔥 ${entry.attackStreakDays}d` : '—',
                },
                { label: 'Last Active', value: formatTimeAgo(entry.lastActiveTimestamp) },
              ].map(({ label, value, colorClass }) => (
                <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
                  <p className={cn('text-sm font-semibold text-white', colorClass)}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show more
            </>
          )}
        </button>
        <ShareButton rank={entry.rank} tab="attackers" />
      </div>
    </motion.div>
  )
}

// ─── Defenders Table ──────────────────────────────────────────────────────────

function DefendersTable({ entries }: { entries: DefenderEntry[] }) {
  const [sortKey, setSortKey] = useState<keyof DefenderEntry>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key as keyof DefenderEntry)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [entries, sortKey, sortDir])

  const colProps = { currentSort: sortKey, currentDir: sortDir, onSort: handleSort }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[1380px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="w-14 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white/50">
              #
            </th>
            <th className="min-w-[200px] px-1 py-3 text-xs font-semibold tracking-wide text-white/50">
              Defender
            </th>
            <ColHeader
              label="Composite Score"
              tooltip="Composite Defender Score: 40% TVL + 30% Attacks Survived + 20% Breach Resilience + 10% Active Sentinels"
              sortKey="compositeScore"
              {...colProps}
            />
            <ColHeader label="Tier" sortKey="defenderTier" {...colProps} />
            <ColHeader
              label="Fees Earned(USD)"
              tooltip="Cumulative fees claimed + pending in USD"
              sortKey="totalFeesEarnedUsd"
              {...colProps}
            />
            <ColHeader
              label="TVL (USD)"
              tooltip="Total Value Locked across all active reward pools in USD"
              sortKey="tvlUsd"
              {...colProps}
            />

            <ColHeader
              label="Longest Surviving"
              tooltip="Days + hours since deployment of the longest-standing unbreached Sentinel"
              sortKey="longestSurvivingHours"
              {...colProps}
            />
            <ColHeader
              label="Attacks Survived"
              tooltip="Total consume_prompt calls where success=false"
              sortKey="totalAttacksSurvived"
              {...colProps}
            />
            <ColHeader
              label="Breach Rate"
              tooltip="Percentage of attacks that successfully breached a Sentinel"
              sortKey="breachRatePct"
              {...colProps}
            />
            <ColHeader
              label="Active Sentinels"
              tooltip="Currently live Sentinels"
              sortKey="activeSentinels"
              {...colProps}
            />
            <ColHeader
              label="Total Sentinels"
              tooltip="All-time Sentinels created, including inactive ones"
              sortKey="totalSentinelsDeployed"
              {...colProps}
            />
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)]">
          {sorted.map((entry, i) => {
            const isTop3 = entry.rank <= 3
            const rowBg = entry.isCurrentUser
              ? 'bg-blue-50/60 hover:bg-blue-50'
              : isTop3
                ? 'bg-transparent hover:bg-white/5'
                : 'bg-transparent hover:bg-white/[0.04]'
            const leftBorder =
              entry.rank === 1
                ? 'border-l-2 border-l-yellow-400'
                : entry.rank === 2
                  ? 'border-l-2 border-l-slate-400'
                  : entry.rank === 3
                    ? 'border-l-2 border-l-amber-600'
                    : entry.isCurrentUser
                      ? 'border-l-2 border-l-blue-400'
                      : ''

            return (
              <motion.tr
                key={entry.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn('transition-colors', rowBg, leftBorder)}
              >
                <td className="px-3 py-3 text-center">
                  <RankCell rank={entry.rank} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <IdentityCell
                      username={entry.username}
                      walletAddress={entry.walletAddress}
                      avatarUrl={entry.avatarUrl}
                    />
                    {entry.isCurrentUser && (
                      <span className="ml-12 w-fit rounded-full border border-blue-500/30 bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="font-bold text-white">
                    {entry.compositeScore.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <DefenderTierBadge tier={entry.defenderTier} />
                </td>
                <td className="px-3 py-3 text-white/70">{formatUsd(entry.totalFeesEarnedUsd)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white">{formatUsd(entry.tvlUsd)}</span>
                  </div>
                </td>

                <td className="px-3 py-3 font-mono text-xs text-white/60">
                  {formatSurvivalTime(entry.longestSurvivingHours)}
                </td>
                <td className="px-3 py-3 font-medium text-white">
                  {entry.totalAttacksSurvived.toLocaleString()}
                </td>
                <td className={cn('px-3 py-3 font-semibold', breachRateColor(entry.breachRatePct))}>
                  {entry.breachRatePct.toFixed(1)}%
                </td>
                <td className="px-3 py-3 text-white/70">{entry.activeSentinels}</td>
                <td className="px-3 py-3 text-white/70">{entry.totalSentinelsDeployed}</td>
                <td className="px-3 py-3">
                  <ShareButton rank={entry.rank} tab="defenders" />
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Attackers Table ──────────────────────────────────────────────────────────

function AttackersTable({ entries }: { entries: AttackerEntry[] }) {
  const [sortKey, setSortKey] = useState<keyof AttackerEntry>('totalBountyWonUsd')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key as keyof AttackerEntry)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [entries, sortKey, sortDir])

  const colProps = { currentSort: sortKey, currentDir: sortDir, onSort: handleSort }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[1200px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="w-14 px-3 py-3 text-center text-xs font-semibold tracking-wide text-white/50">
              #
            </th>
            <th className="min-w-[200px] px-3 py-3 text-xs font-semibold tracking-wide text-white/50">
              Attacker
            </th>
            <ColHeader label="Tier" sortKey="attackerTier" {...colProps} />
            <ColHeader
              label="Total Bounty Won"
              tooltip="Sum of all reward pool payouts received in USD"
              sortKey="totalBountyWonUsd"
              {...colProps}
            />
            <ColHeader
              label="Total Attacks"
              tooltip="All consume_prompt calls by this address"
              sortKey="totalAttacksSent"
              {...colProps}
            />
            <ColHeader
              label="Successful Attacks"
              tooltip="consume_prompt calls where success=true"
              sortKey="successfulBreaches"
              {...colProps}
            />
            <ColHeader
              label="Breach Rate"
              tooltip="Breaches / Total Attacks × 100"
              sortKey="breachRatePct"
              {...colProps}
            />
            <ColHeader
              label="Largest Bounty"
              tooltip="Maximum single payout received in USD"
              sortKey="largestSingleBountyUsd"
              {...colProps}
            />
            <ColHeader
              label="Streak"
              tooltip="Consecutive days with at least one attack sent"
              sortKey="attackStreakDays"
              {...colProps}
            />
            <ColHeader label="Last Active" sortKey="lastActiveTimestamp" {...colProps} />
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)]">
          {sorted.map((entry, i) => {
            const isTop3 = entry.rank <= 3
            const rowBg = entry.isCurrentUser
              ? 'bg-blue-50/60 hover:bg-blue-50'
              : isTop3
                ? 'bg-transparent hover:bg-white/5'
                : 'bg-transparent hover:bg-white/[0.04]'
            const leftBorder =
              entry.rank === 1
                ? 'border-l-2 border-l-yellow-400'
                : entry.rank === 2
                  ? 'border-l-2 border-l-slate-400'
                  : entry.rank === 3
                    ? 'border-l-2 border-l-amber-600'
                    : entry.isCurrentUser
                      ? 'border-l-2 border-l-blue-400'
                      : ''

            return (
              <motion.tr
                key={entry.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn('transition-colors', rowBg, leftBorder)}
              >
                <td className="px-3 py-3 text-center">
                  <RankCell rank={entry.rank} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <IdentityCell
                      username={entry.username}
                      walletAddress={entry.walletAddress}
                      avatarUrl={entry.avatarUrl}
                    />
                    {entry.isCurrentUser && (
                      <span className="ml-12 w-fit rounded-full border border-blue-500/30 bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <AttackerTierBadge tier={entry.attackerTier} />
                </td>
                <td className="px-3 py-3 font-bold text-white">
                  {formatUsd(entry.totalBountyWonUsd)}
                </td>
                <td className="px-3 py-3 text-white/70">
                  {entry.totalAttacksSent.toLocaleString()}
                </td>
                <td className="px-3 py-3 font-medium text-white">{entry.successfulBreaches}</td>
                <td
                  className={cn(
                    'px-3 py-3 font-semibold',
                    entry.breachRatePct > 10
                      ? 'text-emerald-600'
                      : entry.breachRatePct > 5
                        ? 'text-amber-600'
                        : 'text-gray-700'
                  )}
                >
                  {entry.breachRatePct.toFixed(1)}%
                </td>
                <td className="px-3 py-3 text-white/70">
                  {formatUsd(entry.largestSingleBountyUsd)}
                </td>
                <td className="px-3 py-3">
                  {entry.attackStreakDays > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                      <Flame className="h-3.5 w-3.5" />
                      {entry.attackStreakDays}d
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-gray-500">
                  {formatTimeAgo(entry.lastActiveTimestamp)}
                </td>
                <td className="px-3 py-3">
                  <ShareButton rank={entry.rank} tab="attackers" />
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Skeleton Row ────────────────────────────────────────────────────────────

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-[var(--color-border-subtle)]">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-3 rounded bg-[var(--color-bg-elevated)]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function LoadMoreButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border-default)] bg-transparent px-5 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Load more
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NewLeaderboard() {
  const account = useCurrentAccount()
  const connectedWallet = account?.address

  const [defenderSearch, setDefenderSearch] = useState('')
  const [attackerSearch, setAttackerSearch] = useState('')
  const [defenderTierFilter, setDefenderTierFilter] = useState<DefenderTier | ''>('')
  const [attackerTierFilter, setAttackerTierFilter] = useState<AttackerTier | ''>('')

  const defendersQuery = useDefendersLeaderboard(25, defenderSearch, defenderTierFilter)
  const attackersQuery = useAttackersLeaderboard(25, attackerSearch, attackerTierFilter)

  const allDefenders = useMemo(() => {
    const entries = (defendersQuery.data?.pages ?? []).flatMap(p =>
      p.defenders.map(d => mapApiDefender(d, connectedWallet))
    )
    const currentUser = entries.find(e => e.isCurrentUser)
    const rest = entries.filter(e => !e.isCurrentUser)
    return currentUser ? [currentUser, ...rest] : rest
  }, [defendersQuery.data, connectedWallet])

  const allAttackers = useMemo(() => {
    const entries = (attackersQuery.data?.pages ?? []).flatMap(p =>
      p.attackers.map(a => mapApiAttacker(a, connectedWallet))
    )
    const currentUser = entries.find(e => e.isCurrentUser)
    const rest = entries.filter(e => !e.isCurrentUser)
    return currentUser ? [currentUser, ...rest] : rest
  }, [attackersQuery.data, connectedWallet])

  const handleLoadMoreDefenders = useCallback(() => {
    defendersQuery.fetchNextPage()
  }, [defendersQuery])

  const handleLoadMoreAttackers = useCallback(() => {
    attackersQuery.fetchNextPage()
  }, [attackersQuery])

  const defenderTiers: DefenderTier[] = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Legendary']
  const attackerTiers: AttackerTier[] = [
    'Recruit',
    'Hunter',
    'Specialist',
    'Elite',
    'Apex Predator',
  ]

  return (
    <div className="min-h-body pb-16 pt-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-[1400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Page Header ── */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
                  <Trophy className="h-5 w-5 text-[var(--color-text-primary)]" />
                </div>
                <div>
                  <h1 className="page-heading">Leaderboard</h1>
                  <p className="page-subheading mt-1">
                    Track top defenders &amp; attackers in the Red Sentinel ecosystem
                  </p>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <DocsQuickLinks />
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="defenders">
            <TabsList className="mb-6 border-b border-[var(--color-border-subtle)] bg-transparent pb-0">
              <TabsTrigger value="defenders" className="flex items-center gap-2 px-4 py-2 text-sm">
                Defenders
              </TabsTrigger>
              <TabsTrigger value="attackers" className="flex items-center gap-2 px-4 py-2 text-sm">
                Attackers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="defenders">
              <RewardCalculatorBanner />

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    placeholder="Search by username or wallet…"
                    value={defenderSearch}
                    onChange={e => setDefenderSearch(e.target.value)}
                    className="h-9 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] pl-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-default)] focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDefenderTierFilter('')}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      defenderTierFilter === ''
                        ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                        : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    All Tiers
                  </button>
                  {defenderTiers.map(tier => {
                    const cfg = DEFENDER_TIER_CONFIG[tier]
                    const active = defenderTierFilter === tier
                    return (
                      <button
                        key={tier}
                        onClick={() => setDefenderTierFilter(active ? '' : tier)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                            : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        {tier}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                {defendersQuery.isError ? (
                  <EmptyState message="Failed to load defenders. Please try again." />
                ) : defendersQuery.isLoading ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[1380px] border-collapse text-sm">
                      <tbody>
                        <SkeletonRows cols={12} />
                      </tbody>
                    </table>
                  </div>
                ) : allDefenders.length > 0 ? (
                  <DefendersTable entries={allDefenders} />
                ) : (
                  <EmptyState message="No defenders match your filters." />
                )}
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {defendersQuery.isError ? (
                  <EmptyState message="Failed to load defenders. Please try again." />
                ) : defendersQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-32 rounded bg-white/10" />
                          <div className="h-3 w-24 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-14 rounded-lg bg-white/10" />
                        <div className="h-14 rounded-lg bg-white/10" />
                      </div>
                    </div>
                  ))
                ) : allDefenders.length > 0 ? (
                  allDefenders.map(entry => <DefenderCard key={entry.userId} entry={entry} />)
                ) : (
                  <EmptyState message="No defenders match your filters." />
                )}
              </div>

              {defendersQuery.hasNextPage && (
                <LoadMoreButton
                  onClick={handleLoadMoreDefenders}
                  isLoading={defendersQuery.isFetchingNextPage}
                />
              )}

              <p className="mt-4 text-center text-xs text-[var(--color-text-faint)]">
                Sorted by Composite Defender Score · Scores recompute every 5 minutes
              </p>
            </TabsContent>

            {/* ── Attackers Tab ── */}
            <TabsContent value="attackers">
              {/* Search + Filter */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <Input
                    placeholder="Search by username or wallet…"
                    value={attackerSearch}
                    onChange={e => setAttackerSearch(e.target.value)}
                    className="h-9 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] pl-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-default)] focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setAttackerTierFilter('')}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      attackerTierFilter === ''
                        ? 'border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-[var(--color-text-on-gold)]'
                        : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
                    )}
                  >
                    All Tiers
                  </button>
                  {attackerTiers.map(tier => {
                    const cfg = ATTACKER_TIER_CONFIG[tier]
                    const active = attackerTierFilter === tier
                    return (
                      <button
                        key={tier}
                        onClick={() => setAttackerTierFilter(active ? '' : tier)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                            : 'border-[var(--color-border-default)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        {tier}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                {attackersQuery.isError ? (
                  <EmptyState message="Failed to load attackers. Please try again." />
                ) : attackersQuery.isLoading ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[1200px] border-collapse text-sm">
                      <tbody>
                        <SkeletonRows cols={10} />
                      </tbody>
                    </table>
                  </div>
                ) : allAttackers.length > 0 ? (
                  <AttackersTable entries={allAttackers} />
                ) : (
                  <EmptyState message="No attackers match your filters." />
                )}
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {attackersQuery.isError ? (
                  <EmptyState message="Failed to load attackers. Please try again." />
                ) : attackersQuery.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-32 rounded bg-white/10" />
                          <div className="h-3 w-24 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-14 rounded-lg bg-white/10" />
                        <div className="h-14 rounded-lg bg-white/10" />
                      </div>
                    </div>
                  ))
                ) : allAttackers.length > 0 ? (
                  allAttackers.map(entry => <AttackerCard key={entry.userId} entry={entry} />)
                ) : (
                  <EmptyState message="No attackers match your filters." />
                )}
              </div>

              {attackersQuery.hasNextPage && (
                <LoadMoreButton
                  onClick={handleLoadMoreAttackers}
                  isLoading={attackersQuery.isFetchingNextPage}
                />
              )}

              <p className="mt-4 text-center text-xs text-[var(--color-text-faint)]">
                Sorted by Total Bounty Won · Data recomputes every 5 minutes
              </p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-16 text-center">
      <Search className="mb-4 h-10 w-10 text-[var(--color-text-faint)]" />
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{message}</p>
    </div>
  )
}
