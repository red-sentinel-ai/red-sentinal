import { Trophy, Crown, Medal, Award, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { Skeleton } from '../ui/skeleton'

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
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-24 rounded-lg bg-[#383838]/30" />
            <Skeleton className="h-24 rounded-lg bg-[#383838]/30" />
            <Skeleton className="h-24 rounded-lg bg-[#383838]/30" />
          </div>
          <Skeleton className="h-4 w-full mt-6 bg-[#383838]/30" />
          <Skeleton className="h-2 w-full mt-2 bg-[#383838]/30" />
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
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            <motion.div className="p-8 border-b lg:border-b-0 lg:border-r border-[#383838]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-[#558EB4]" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {totalPoints.toLocaleString()}
                  </div>
                  <div className="text-[#B5B5B5] font-medium">{pointsSymbol} Points</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="p-8 border-b lg:border-b-0 lg:border-r border-[#383838]">
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
                  <div className="text-[#B5B5B5] font-medium">Current Tier</div>
                </div>
              </div>
            </motion.div>

            <motion.div className="p-8">
              {nextTier ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-[#8F564E]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">
                      {nextTier.minPoints - totalPoints}
                    </div>
                    <div className="text-[#B5B5B5] font-medium">Points to {nextTier.name}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-[#8F564E]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#8F564E]">Max Tier</div>
                    <div className="text-[#B5B5B5] font-medium">Congratulations!</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {nextTier && (
            <div className="px-8 pb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-[#B5B5B5]">
                    Progress to {nextTier.name}
                  </span>
                  <span className="bg-[#558EB4]/20 text-[#558EB4] px-2 py-1 rounded-full text-xs font-medium border border-[#558EB4]/30">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <div className="h-3 bg-[#383838] rounded-full overflow-hidden">
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
      return <Crown className="h-8 w-8 text-[#8F564E]" />
    case 'gold':
      return <Trophy className="h-8 w-8 text-[#8F564E]" />
    case 'silver':
      return <Medal className="h-8 w-8 text-[#B5B5B5]" />
    default:
      return <Award className="h-8 w-8 text-[#8F564E]" />
  }
}

const getTierGradient = (tierName: string) => {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return 'from-[#8F564E]/20 to-[#E53922]/20'
    case 'gold':
      return 'from-[#8F564E]/20 to-[#E53922]/20'
    case 'silver':
      return 'from-[#B5B5B5]/20 to-[#383838]/20'
    default:
      return 'from-[#8F564E]/20 to-[#E53922]/20'
  }
}
