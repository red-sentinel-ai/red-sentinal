'use client'

import {
  Trophy,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, TabsTrigger, TabsContent, TabsList, Tabs } from '@/components/ui'
import { PointsDisplay } from './PointsDisplay'
import { MissionsGrid } from './MissionsGrid'
import { RecentActivity } from './RecentActivity'
import { useUserRewards } from '@/hooks/rewards/useUserRewards'
import { useRewardsMissions } from '@/hooks/rewards/useRewardsMissions'
import { RewardsAccessGuard } from './RewardsAccessGuard'
import { RAVEN_REWARDS_CONSTANTS } from '@/constants/ravenRewards'
import { REWARDS_DOCS_URL } from '@/constants'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectPrompt } from '../ConnectPrompt'

export function RewardsDashboard() {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: userRewards, isLoading: isLoadingUser } = useUserRewards(address)
  const { data: missionsData, isLoading: isLoadingMissions } = useRewardsMissions()

  const effectiveMissionsData = isLoadingMissions
    ? RAVEN_REWARDS_CONSTANTS.LOCAL_FALLBACK_CONFIG
    : missionsData

  if (!account?.address) {
    return (
      <ConnectPrompt
        title="Welcome User"
        subtitle="Connect your wallet to see your activities"
        theme="defender"
      />
    )
  }

  if (!isLoadingMissions && !missionsData?.enabled) {
    return (
      <div className="min-h-body bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]">
        <div className="container mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center mx-auto mb-6">
                    <Trophy className="h-12 w-12 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white uppercase">
                    Raven Rewards Coming Soon
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Our rewards program is currently being prepared. Check back soon!
                  </p>
                  {missionsData?.message && (
                    <p className="text-sm text-gray-400 mt-4 bg-[#12121266] p-3 rounded-lg border border-[#444]">
                      {missionsData.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <RewardsAccessGuard>
      <div className="min-h-body bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-3 rounded-full mb-6 border border-blue-500/50 shadow-lg shadow-blue-500/20">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  <span className="text-base font-semibold text-cyan-300">
                    Sui Sentinel Rewards
                  </span>
                </div>
                <h1 className="text-6xl font-bold mb-6 text-white uppercase tracking-wide">
                  Earn. Compete. Conquer.
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Complete missions, earn points, and unlock exclusive rewards in the Sui Sentinel
                  ecosystem
                </p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Link
                    href={REWARDS_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="border-2 border-blue-500 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl px-8 py-4 text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-cyan-600/30 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 group flex items-center gap-3 font-semibold shadow-lg shadow-blue-500/20">
                      <BookOpen className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      Program Guide
                      <ExternalLink className="h-4 w-4 opacity-70" />
                    </button>
                  </Link>
                </div>
                {isLoadingMissions && (
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                    <span className="text-base text-cyan-300 font-medium">
                      Loading latest missions...
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <PointsDisplay
                totalPoints={userRewards?.user?.total_points || 0}
                tier={userRewards?.user.rewards_tier || 'bronze'}
                isLoading={isLoadingUser}
                pointsSymbol={effectiveMissionsData?.points_symbol || 'RP'}
              />
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl shadow-2xl">
                <CardContent className="p-8">
                  <Tabs defaultValue="missions">
                    <div className="flex items-center justify-between mb-8">
                      <TabsList className="bg-transparent border-b border-[#444] p-0 h-auto rounded-none w-auto">
                        <TabsTrigger
                          value="missions"
                          className="flex items-center gap-2 data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-300 border-b-[3px] border-b-[#444] text-gray-400 hover:text-gray-200 transition-all duration-300 px-6 py-4 rounded-none bg-transparent font-medium text-base"
                        >
                          <Target className="h-5 w-5" />
                          <span className="hidden sm:inline">Missions</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="activity"
                          className="flex items-center gap-2 data-[state=active]:border-b-emerald-500 data-[state=active]:text-emerald-300 border-b-[3px] border-b-[#444] text-gray-400 hover:text-gray-200 transition-all duration-300 px-6 py-4 rounded-none bg-transparent font-medium text-base"
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="hidden sm:inline">Activity</span>
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-4">
                        <Link
                          href={REWARDS_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="border border-blue-500/50 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-lg px-6 py-3 text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-cyan-600/30 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 group flex items-center gap-2 font-medium">
                            <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="hidden sm:inline">Docs</span>
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </button>
                        </Link>
                        <Link href="/rewards/leaderboard">
                          <button className="border border-orange-500/50 bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-lg px-6 py-3 text-orange-300 hover:bg-gradient-to-r hover:from-orange-600/30 hover:to-red-600/30 hover:border-orange-400 hover:text-orange-200 transition-all duration-300 flex items-center gap-2 font-medium">
                            <Trophy className="h-4 w-4" />
                            Leaderboard
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                    <div>
                      <TabsContent
                        value="missions"
                        className="space-y-6"
                      >
                        <MissionsGrid
                          missions={effectiveMissionsData?.missions || []}
                          completedMissions={userRewards?.completed_missions || {}}
                          isLoading={isLoadingMissions}
                          pointsSymbol={effectiveMissionsData?.points_symbol || 'RP'}
                        />
                      </TabsContent>
                      <TabsContent
                        value="activity"
                        className="space-y-6"
                      >
                        <RecentActivity
                          activities={userRewards?.recent_activity || []}
                          isLoading={isLoadingUser}
                          pointsSymbol={effectiveMissionsData?.points_symbol || 'RP'}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </RewardsAccessGuard>
  )
}
