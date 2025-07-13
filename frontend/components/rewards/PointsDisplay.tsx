import { Trophy, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react'
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
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
        <Card className="bg-black/30 border-gray-800">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full mt-6" />
            <Skeleton className="h-2 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
      <Card className="bg-black/30 border-gray-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="text-gray-400 font-medium">{pointsSymbol} Points</div>
                </div>
              </div>
            </div>

            <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierGradient(
                    tier
                  )} flex items-center justify-center`}
                >
                  {getTierIcon(tier)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{tierConfig?.name || tier}</div>
                  <div className="text-gray-400 font-medium">Current Tier</div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {nextTier ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">
                      {nextTier.minPoints - totalPoints}
                    </div>
                    <div className="text-gray-400 font-medium">Points to {nextTier.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-400">Max Tier</div>
                    <div className="text-gray-400 font-medium">Congratulations!</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {nextTier && (
            <div className="px-8 pb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">
                    Progress to {nextTier.name}
                  </span>
                  <span className="bg-primary/20 text-primary">{Math.round(progressToNext)}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressToNext}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                {/* <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {tierConfig?.minPoints || 0} {pointsSymbol}
                  </span>
                  <span>
                    {nextTier.minPoints} {pointsSymbol}
                  </span>
                </div> */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const getTierIcon = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return <Crown className="h-8 w-8 text-purple-400" />
    case 'gold':
      return <Trophy className="h-8 w-8 text-yellow-400" />
    case 'silver':
      return <Medal className="h-8 w-8 text-gray-300" />
    default:
      return <Award className="h-8 w-8 text-orange-400" />
  }
}

const getTierGradient = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return 'from-purple-500/20 to-indigo-500/20'
    case 'gold':
      return 'from-yellow-500/20 to-orange-500/20'
    case 'silver':
      return 'from-gray-400/20 to-gray-600/20'
    default:
      return 'from-orange-500/20 to-red-500/20'
  }
}
