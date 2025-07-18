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
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a]">
        <div className="container mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
                <CardContent className="text-center py-16">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20 flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Trophy className="h-12 w-12 text-[#558EB4]" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-4 text-[#B8B8B8] uppercase">
                    Raven Rewards Coming Soon
                  </h2>
                  <p className="text-[#B5B5B5] text-lg">
                    Our rewards program is currently being prepared. Check back soon!
                  </p>
                  {missionsData?.message && (
                    <p className="text-sm text-[#B5B5B5] mt-4 bg-[#12121266] p-3 rounded-lg border border-[#383838]">
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
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#558EB4]/20 to-[#1388D5]/20 px-4 py-2 rounded-full mb-4 border border-[#558EB4]/30">
                  <Sparkles className="h-4 w-4 text-[#558EB4]" />
                  <span className="text-sm font-medium text-[#558EB4]">Sui Sentinel Rewards</span>
                </motion.div>
                <h1 className="text-5xl font-bold mb-4 text-[#B8B8B8] uppercase">
                  Earn. Compete. Conquer.
                </h1>
                <p className="text-xl text-[#B5B5B5] max-w-2xl mx-auto mb-6">
                  Complete missions, earn points, and unlock exclusive rewards in the Sui Sentinel
                  ecosystem
                </p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Link
                    href={REWARDS_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.button className="border border-[#558EB4] bg-[#12121266] backdrop-blur-lg rounded-lg px-6 py-3 text-[#558EB4] hover:bg-[#1388D5] hover:text-black hover:border-[#1388D5] transition-all duration-300 group flex items-center gap-2">
                      <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                      Program Guide
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </motion.button>
                  </Link>
                </div>
                {isLoadingMissions && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#558EB4]"></div>
                    <span className="text-sm text-[#558EB4]">Loading latest missions...</span>
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
              <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
                <CardContent className="p-6">
                  <Tabs defaultValue="missions">
                    <div className="flex items-center justify-between mb-6">
                      <TabsList className="grid grid-cols-2 lg:flex bg-[#12121266] backdrop-blur-lg border border-[#383838] p-1 rounded-lg">
                        <TabsTrigger
                          value="missions"
                          className="flex items-center gap-2 data-[state=active]:bg-[#558EB4]/20 data-[state=active]:text-[#558EB4] text-[#B5B5B5] hover:text-white transition-colors"
                        >
                          <Target className="h-4 w-4" />
                          <span className="hidden sm:inline">Missions</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="activity"
                          className="flex items-center gap-2 data-[state=active]:bg-[#558EB4]/20 data-[state=active]:text-[#558EB4] text-[#B5B5B5] hover:text-white transition-colors"
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="hidden sm:inline">Activity</span>
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-3">
                        <Link
                          href={REWARDS_DOCS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <motion.button className="border border-[#558EB4]/30 bg-[#12121266] backdrop-blur-lg rounded-lg px-4 py-2 text-[#558EB4] hover:bg-[#558EB4]/10 hover:border-[#558EB4]/50 transition-all duration-300 group flex items-center gap-2">
                            <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="hidden sm:inline">Docs</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </motion.button>
                        </Link>
                        <Link href="/rewards/leaderboard">
                          <motion.button className="border border-[#8F564E] bg-[#12121266] backdrop-blur-lg rounded-lg px-4 py-2 text-[#8F564E] hover:bg-[#E53922] hover:text-black hover:border-[#E53922] transition-all duration-300 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Leaderboard
                            <ArrowRight className="h-3 w-3" />
                          </motion.button>
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
