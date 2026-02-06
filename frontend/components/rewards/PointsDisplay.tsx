import { Trophy, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { Skeleton, Card, CardContent } from '../ui'

interface PointsDisplayProps {
  totalPoints: number
  tier: string
  isLoading: boolean
  pointsSymbol: string
}

export function PointsDisplay({ totalPoints, tier, isLoading, pointsSymbol }: PointsDisplayProps) {
  const tierConfig = Object.values(REWARDS_CONSTANTS.TIERS).find(
    t => t.name.toLowerCase() === tier.toLowerCase()
  )

  const nextTier = Object.values(REWARDS_CONSTANTS.TIERS).find(t => t.minPoints > totalPoints)

  const progressToNext = nextTier
    ? ((totalPoints - (tierConfig?.minPoints || 0)) /
        (nextTier.minPoints - (tierConfig?.minPoints || 0))) *
      100
    : 100

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-gray-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
          </div>
          <Skeleton className="mt-6 h-4 w-full bg-gray-200" />
          <Skeleton className="mt-2 h-2 w-full bg-gray-200" />
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
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <motion.div className="border-b border-gray-200 p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Zap className="h-8 w-8 text-black" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="font-medium text-gray-500">{pointsSymbol} Tokens</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="border-b border-gray-200 p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-gray-100`}
                >
                  {getTierIcon(tier)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">{tierConfig?.name || tier}</div>
                  <div className="font-medium text-gray-500">Current Tier</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="p-8">
              {nextTier ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <TrendingUp className="h-8 w-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-black">
                      {Math.round(nextTier.minPoints - totalPoints).toLocaleString()}
                    </div>
                    <div className="font-medium text-gray-500">Tokens to {nextTier.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Crown className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">Max Tier</div>
                    <div className="font-medium text-gray-500">Congratulations!</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {nextTier && (
            <div className="px-8 pb-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Progress to {nextTier.name}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-black">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full bg-black transition-all duration-1000 ease-out"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
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
  const className = 'h-8 w-8 text-black'
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return <Crown className={className} />
    case 'gold':
      return <Trophy className={className} />
    case 'silver':
      return <Medal className={className} />
    default:
      return <Award className={className} />
  }
}
