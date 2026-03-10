'use client'

import { Shield, Swords, Trophy, Coins, CheckCircle, Lock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { useDefenderMissions, useStakingHistory, type MilestoneThreshold } from '@/hooks/rewards/useDefenderMissions'
import { formatDistanceToNow, format } from 'date-fns'

// ─── Booster tier colors matching the rest of the app ────────────────────────
const TIER_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  EPIC:      { label: 'Epic',      bg: 'bg-purple-100', text: 'text-purple-800' },
  LEGENDARY: { label: 'Legendary', bg: 'bg-orange-100', text: 'text-orange-800' },
  MYTHIC:    { label: 'Mythic',    bg: 'bg-red-100',    text: 'text-red-800'    },
  DIVINE:    { label: 'Divine',    bg: 'bg-yellow-100', text: 'text-yellow-800' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const s = TIER_STYLE[tier] ?? { label: tier, bg: 'bg-gray-100', text: 'text-gray-700' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function MilestoneRow({ item, current }: { item: MilestoneThreshold; current: number }) {
  const pct = Math.min(100, Math.round((current / item.target) * 100))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-black">
          {item.target.toLocaleString()} attacks survived
        </span>
        <div className="flex items-center gap-2">
          <TierBadge tier={item.tier} />
          {item.awarded
            ? <CheckCircle className="h-4 w-4 text-green-500" />
            : <Lock className="h-4 w-4 text-gray-400" />
          }
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${item.awarded ? 'bg-green-500' : 'bg-black'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-500">
        {Math.min(current, item.target).toLocaleString()} / {item.target.toLocaleString()}
      </p>
    </div>
  )
}

function StreakMilestone({ item, currentDays }: { item: MilestoneThreshold; currentDays: number }) {
  const reached = currentDays >= item.target

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${
      item.awarded ? 'border-green-200 bg-green-50' : reached ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'
    }`}>
      <div>
        <p className="font-semibold text-black">{item.target}-day undefeated</p>
        <p className="text-xs text-gray-500">
          {item.awarded ? 'Booster awarded' : reached ? 'Awarding soon…' : `${item.target - currentDays} days remaining`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <TierBadge tier={item.tier} />
        {item.awarded
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : reached
            ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            : <Lock className="h-5 w-5 text-gray-300" />
        }
      </div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-black">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// ─── Staking History Table ────────────────────────────────────────────────────

function StakingHistoryTable({ walletAddress }: { walletAddress: string }) {
  const { data, isLoading } = useStakingHistory(walletAddress, 10)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data?.records?.length) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">No staking records yet — rewards distribute daily at 02:00 UTC.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Pool</th>
            <th className="pb-2 pr-4 font-medium">Duration ×</th>
            <th className="pb-2 pr-4 font-medium">Defense ×</th>
            <th className="pb-2 font-medium">Earned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.records.map((r, i) => (
            <tr key={i} className={r.transferSuccess ? '' : 'opacity-50'}>
              <td className="py-2 pr-4 text-gray-700">
                {format(new Date(r.date), 'MMM d, yyyy')}
              </td>
              <td className="py-2 pr-4 text-gray-700">{r.poolSizeSui.toFixed(1)} SUI</td>
              <td className="py-2 pr-4 text-gray-700">{r.durationMultiplier}x</td>
              <td className="py-2 pr-4 text-gray-700">{r.defenseMultiplier.toFixed(2)}x</td>
              <td className="py-2 font-semibold text-black">
                {r.transferSuccess
                  ? `+${r.dailyRewardAmount.toLocaleString()}`
                  : <span className="text-red-500 text-xs">Failed</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DefenderMissionsProps {
  walletAddress: string
}

export function DefenderMissions({ walletAddress }: DefenderMissionsProps) {
  const { data, isLoading, error } = useDefenderMissions(walletAddress)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 py-12 text-center">
        <p className="text-sm text-gray-500">Could not load defender missions. Deploy a Sentinel to get started.</p>
      </div>
    )
  }

  const { milestones, staking } = data

  return (
    <div className="space-y-6">

      {/* ── Section 1: Attack Survival Milestones ── */}
      <Card className="rounded-2xl border-gray-200">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black">Attack Survival Milestones</h3>
              <p className="text-xs text-gray-500">One-time booster for withstanding attacks across all your Sentinels</p>
            </div>
          </div>

          <div className="space-y-5">
            {milestones.attacksSurvived.thresholds.map(threshold => (
              <MilestoneRow
                key={threshold.target}
                item={threshold}
                current={milestones.attacksSurvived.current}
              />
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600">
              Total attacks survived: <span className="font-semibold text-black">{milestones.attacksSurvived.current.toLocaleString()}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Undefeated Streak ── */}
      <Card className="rounded-2xl border-gray-200">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black">Undefeated Streak</h3>
              <p className="text-xs text-gray-500">Consecutive days without any of your Sentinels being breached</p>
            </div>
          </div>

          {/* Current streak counter */}
          <div className="mb-6 flex items-center justify-center rounded-xl border border-gray-200 py-6">
            <div className="text-center">
              <p className="text-5xl font-black text-black">{milestones.undefeatedStreak.currentDays}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {milestones.undefeatedStreak.currentDays === 1 ? 'day' : 'days'} undefeated
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {milestones.undefeatedStreak.thresholds.map(threshold => (
              <StreakMilestone
                key={threshold.target}
                item={threshold}
                currentDays={milestones.undefeatedStreak.currentDays}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Leaderboard Achievements ── */}
      <Card className="rounded-2xl border-gray-200">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black">Leaderboard Achievements</h3>
              <p className="text-xs text-gray-500">Earn boosters by climbing the defender leaderboard</p>
            </div>
          </div>

          {milestones.leaderboard.currentRank && (
            <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-600">
                Current rank: <span className="font-semibold text-black">#{milestones.leaderboard.currentRank}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Top 10 */}
            <div className={`flex items-center justify-between rounded-xl border p-4 ${
              milestones.leaderboard.top10Achieved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <p className="font-semibold text-black">Top 10 Defender</p>
                <p className="text-xs text-gray-500">
                  {milestones.leaderboard.top10Achieved ? 'Achieved — lifetime' : 'Reach rank 1–10'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TierBadge tier="LEGENDARY" />
                {milestones.leaderboard.top10Achieved
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : <Lock className="h-5 w-5 text-gray-300" />
                }
              </div>
            </div>

            {/* Monthly Rank 1 */}
            <div className={`flex items-center justify-between rounded-xl border p-4 ${
              milestones.leaderboard.monthlyRank1AchievedAt ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'
            }`}>
              <div>
                <p className="font-semibold text-black">Monthly #1 Defender</p>
                <p className="text-xs text-gray-500">
                  {milestones.leaderboard.monthlyRank1AchievedAt
                    ? `Won ${formatDistanceToNow(new Date(milestones.leaderboard.monthlyRank1AchievedAt), { addSuffix: true })}`
                    : 'Hold rank #1 at month end'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TierBadge tier="DIVINE" />
                {milestones.leaderboard.monthlyRank1AchievedAt
                  ? <CheckCircle className="h-5 w-5 text-yellow-500" />
                  : <Lock className="h-5 w-5 text-gray-300" />
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Staking Rewards ── */}
      <Card className="rounded-2xl border-gray-200">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black">Daily Staking Rewards</h3>
              <p className="text-xs text-gray-500">SENTINEL distributed daily based on your pool size, tenure, and defence quality</p>
            </div>
          </div>

          {staking.poolSizeSui > 0 ? (
            <>
              {/* Key stats row */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <StatCell label="Pool Size" value={`${staking.poolSizeSui.toFixed(1)} SUI`} />
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <StatCell label="Duration" value={`${staking.durationMultiplier}x`} />
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <StatCell label="Defense" value={`${staking.defenseMultiplier}x`} />
                </div>
                <div className="rounded-xl border border-black bg-black p-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{staking.estimatedDailyReward.toLocaleString()}</p>
                    <p className="text-xs text-gray-300">Daily SENTINEL</p>
                  </div>
                </div>
              </div>

              {/* Formula breakdown */}
              <div className="mb-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <p className="mb-1 font-medium text-gray-800">Formula</p>
                <code className="text-xs">
                  ({staking.poolSizeSui.toFixed(2)} SUI × 50) × {staking.durationMultiplier}x × {staking.defenseMultiplier}x = <strong className="text-black">{staking.estimatedDailyReward.toLocaleString()} SENTINEL</strong>
                </code>
              </div>

              {/* Lifetime earned */}
              {staking.totalStakingEarned > 0 && (
                <div className="mb-5 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-600">Total staking earned (lifetime)</span>
                  <span className="font-bold text-black">{staking.totalStakingEarned.toLocaleString()} SENTINEL</span>
                </div>
              )}

              {/* History */}
              <div>
                <p className="mb-3 text-sm font-semibold text-black">Recent Payouts</p>
                <StakingHistoryTable walletAddress={walletAddress} />
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center">
              <Coins className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">
                Fund a Sentinel with SUI to start earning daily staking rewards.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
