'use client'

import { Trophy, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { RAVEN_REWARDS_CONSTANTS } from '@/constants/ravenRewards'
import { Skeleton } from '../ui/skeleton'

interface PointsDisplayProps {
  totalPoints: number
  tier: string
  isLoading: boolean
  pointsSymbol: string
}

export function PointsDisplay({ totalPoints, tier, isLoading, pointsSymbol }: PointsDisplayProps) {
  const tierConfig = Object.values(RAVEN_REWARDS_CONSTANTS.TIERS).find(
    (t) => t.name.toLowerCase() === tier.toLowerCase()
  )

  const nextTier = Object.values(RAVEN_REWARDS_CONSTANTS.TIERS).find(
    (t) => t.minPoints > totalPoints
  )

  const progressToNext = nextTier
    ? ((totalPoints - (tierConfig?.minPoints || 0)) /
        (nextTier.minPoints - (tierConfig?.minPoints || 0))) *
      100
    : 100

  if (isLoading) {
    return (
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-xl bg-[#333]/50" />
            <Skeleton className="h-28 rounded-xl bg-[#333]/50" />
            <Skeleton className="h-28 rounded-xl bg-[#333]/50" />
          </div>
          <Skeleton className="h-4 w-full mt-6 bg-[#333]/50" />
          <Skeleton className="h-3 w-full mt-3 bg-[#333]/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#444] bg-gradient-to-br from-yellow-600/10 to-amber-600/10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Zap className="h-10 w-10 text-yellow-400" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="text-yellow-300 font-semibold text-lg">{pointsSymbol} Points</div>
                </div>
              </div>
            </div>

            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#444] bg-gradient-to-br from-purple-600/10 to-indigo-600/10">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${getTierGradient(
                    tier
                  )} flex items-center justify-center shadow-lg ${getTierShadow(tier)}`}
                >
                  {getTierIcon(tier)}
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {tierConfig?.name || tier}
                  </div>
                  <div className="text-purple-300 font-semibold">Current Tier</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-emerald-600/10 to-green-600/10">
              {nextTier ? (
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <TrendingUp className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white mb-1">
                      {nextTier.minPoints - totalPoints}
                    </div>
                    <div className="text-emerald-300 font-semibold">Points to {nextTier.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Crown className="h-10 w-10 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-400 mb-1">Max Tier</div>
                    <div className="text-pink-300 font-semibold">Congratulations!</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {nextTier && (
            <div className="p-8 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-200">
                    Progress to {nextTier.name}
                  </span>
                  <span className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 px-4 py-1 rounded-full text-sm font-bold border border-blue-500/50 shadow-lg shadow-blue-500/20">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <div className="h-4 bg-[#333] rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] transition-all duration-1000 ease-out relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const getTierIcon = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return <Crown className="h-10 w-10 text-purple-300" />
    case 'gold':
      return <Trophy className="h-10 w-10 text-yellow-400" />
    case 'silver':
      return <Medal className="h-10 w-10 text-gray-300" />
    default:
      return <Award className="h-10 w-10 text-orange-400" />
  }
}

const getTierGradient = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return 'from-purple-500/30 to-indigo-500/30'
    case 'gold':
      return 'from-yellow-500/30 to-amber-500/30'
    case 'silver':
      return 'from-gray-400/30 to-slate-500/30'
    default:
      return 'from-orange-500/30 to-red-500/30'
  }
}

const getTierShadow = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return 'shadow-purple-500/20'
    case 'gold':
      return 'shadow-yellow-500/20'
    case 'silver':
      return 'shadow-gray-500/20'
    default:
      return 'shadow-orange-500/20'
  }
}
