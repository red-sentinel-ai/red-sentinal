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

import { Card, CardContent } from '@/components/ui/card'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PointsDisplay } from './PointsDisplay'
import { MissionsGrid } from './MissionsGrid'
import { RecentActivity } from './RecentActivity'
import { useUserRewards } from '@/hooks/rewards/useUserRewards'
import { useRewardsMissions } from '@/hooks/rewards/useRewardsMissions'
import { RewardsAccessGuard } from './RewardsAccessGuard'
import { RAVEN_REWARDS_CONSTANTS } from '@/constants/ravenRewards'
import { REWARDS_DOCS_URL } from '@/constants'
import { useCurrentAccount } from '@mysten/dapp-kit'

export function RewardsDashboard() {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: userRewards, isLoading: isLoadingUser } = useUserRewards(address)
  const { data: missionsData, isLoading: isLoadingMissions } = useRewardsMissions()

  const effectiveMissionsData = isLoadingMissions
    ? RAVEN_REWARDS_CONSTANTS.LOCAL_FALLBACK_CONFIG
    : missionsData

  if (!isLoadingMissions && !missionsData?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-lg"></div>
            <Card className="max-w-2xl mx-auto bg-black/30 border-gray-800">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Raven Rewards Coming Soon
                </h2>
                <p className="text-gray-400 text-lg">
                  Our rewards program is currently being prepared. Check back soon!
                </p>
                {missionsData?.message && (
                  <p className="text-sm text-gray-500 mt-4 bg-black/20 p-3 rounded-lg">
                    {missionsData.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RewardsAccessGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-purple-500/20 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Raven House Rewards</span>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Earn. Compete. Conquer.
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
                Complete missions, earn points, and unlock exclusive rewards in the Raven House
                ecosystem
              </p>

              <div className="flex items-center justify-center gap-4 mb-4">
                <Link
                  href={REWARDS_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:from-blue-500/20 hover:bg-gradient-to-r hover:to-cyan-500/20 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 transition-all duration-300 group">
                    <BookOpen className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Program Guide
                    <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
                  </button>
                </Link>
              </div>

              {isLoadingMissions && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-primary">Loading latest missions...</span>
                </div>
              )}
            </div>

            <div className="mb-12">
              <PointsDisplay
                totalPoints={userRewards?.user?.total_points || 0}
                tier={userRewards?.user.rewards_tier || 'bronze'}
                isLoading={isLoadingUser}
                pointsSymbol={effectiveMissionsData?.points_symbol || 'RP'}
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-primary/10 blur-xl -z-10 rounded-xl"></div>
              <Tabs
                defaultValue="missions"
                className="bg-black/20 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <TabsList className="grid grid-cols-2 lg:flex bg-black/40 p-1">
                    <TabsTrigger
                      value="missions"
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                    >
                      <Target className="h-4 w-4" />
                      <span className="hidden sm:inline">Missions</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
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
                      <button className="bg-black/20 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 transition-all duration-300 group">
                        <BookOpen className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="hidden sm:inline">Docs</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                      </button>
                    </Link>

                    <Link href="/rewards/leaderboard">
                      <button className="bg-black/20 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-yellow-400 hover:text-yellow-300 transition-all duration-300">
                        <Trophy className="h-4 w-4 mr-2" />
                        Leaderboard
                        <ArrowRight className="h-3 w-3 ml-1" />
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
            </div>
          </div>
        </div>
      </div>
    </RewardsAccessGuard>
  )
}
