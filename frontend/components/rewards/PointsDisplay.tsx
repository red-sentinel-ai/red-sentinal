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
    (t) => t.name.toLowerCase() === tier.toLowerCase()
  )

  const nextTier = Object.values(REWARDS_CONSTANTS.TIERS).find((t) => t.minPoints > totalPoints)

  const progressToNext = nextTier
    ? ((totalPoints - (tierConfig?.minPoints || 0)) /
        (nextTier.minPoints - (tierConfig?.minPoints || 0))) *
      100
    : 100

  if (isLoading) {
    return (
      <Card className="bg-gray-50 border border-gray-200 rounded-2xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
            <Skeleton className="h-24 rounded-lg bg-gray-200" />
          </div>
          <Skeleton className="h-4 w-full mt-6 bg-gray-200" />
          <Skeleton className="h-2 w-full mt-2 bg-gray-200" />
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
      <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <motion.div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-black" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-black">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="text-gray-500 font-medium">{pointsSymbol} Points</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center`}
                >
                  {getTierIcon(tier)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">{tierConfig?.name || tier}</div>
                  <div className="text-gray-500 font-medium">Current Tier</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="p-8">
              {nextTier ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-black">
                      {nextTier.minPoints - totalPoints}
                    </div>
                    <div className="text-gray-500 font-medium">Points to {nextTier.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">Max Tier</div>
                    <div className="text-gray-500 font-medium">Congratulations!</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {nextTier && (
            <div className="px-8 pb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Progress to {nextTier.name}
                  </span>
                  <span className="bg-gray-100 text-black px-2 py-1 rounded-full text-xs font-medium border border-gray-200">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
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
