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
import { useCurrentAccount } from '@mysten/dapp-kit'

import { Card, CardContent, TabsTrigger, TabsContent, TabsList, Tabs } from '@/components/ui'
import { PointsDisplay } from './PointsDisplay'
import { MissionsGrid } from './MissionsGrid'
import { RecentActivity } from './RecentActivity'
import { useUserRewards } from '@/hooks/rewards/useUserRewards'
import { useRewardsMissions } from '@/hooks/rewards/useRewardsMissions'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { REWARDS_DOCS_URL } from '@/constants'
import { ConnectPrompt } from '../ConnectPrompt'

export function RewardsDashboard() {
  const account = useCurrentAccount()
  const address = account?.address
  const { data: userRewards, isLoading: isLoadingUser } = useUserRewards(address)
  const { data: missionsData, isLoading: isLoadingMissions } = useRewardsMissions()

  const effectiveMissionsData = isLoadingMissions
    ? REWARDS_CONSTANTS.LOCAL_FALLBACK_CONFIG
    : missionsData

  if (!account?.address) {
    return (
      <ConnectPrompt
        title="Rewards Program"
        subtitle="Connect your wallet to view missions and track your points."
        theme="defender"
      />
    )
  }

  if (!isLoadingMissions && !missionsData?.enabled) {
    return (
      <div className="min-h-body flex items-center justify-center">
        <div className="container mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              className="mx-auto max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="py-16 text-center">
                  <motion.div
                    className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Trophy className="h-12 w-12 text-blue-600" />
                  </motion.div>
                  <h2 className="mb-4 text-3xl font-bold uppercase text-black">
                    Rewards Coming Soon
                  </h2>
                  <p className="text-lg text-gray-600">
                    Our rewards program is currently being prepared. Check back soon!
                  </p>
                  {missionsData?.message && (
                    <p className="mt-4 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-500">
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
    <div className="min-h-body">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-4 py-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Sui Sentinel Rewards</span>
              </motion.div>
              <h1 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl md:text-5xl">
                Earn. Compete. Conquer.
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 sm:text-xl">
                Complete missions, earn points, and unlock exclusive rewards in the Sui Sentinel
                ecosystem
              </p>
              <div className="mb-4 flex items-center justify-center gap-4">
                <Link href={REWARDS_DOCS_URL} target="_blank" rel="noopener noreferrer">
                  <motion.button className="btn btn-outline flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Program Guide
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </motion.button>
                </Link>
              </div>
              {isLoadingMissions && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-black"></div>
                  <span className="text-sm text-black">Loading latest missions...</span>
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
              pointsSymbol={effectiveMissionsData?.points_symbol || 'SENTINEL'}
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="rounded-2xl border border-gray-200 bg-gray-50/50">
              <CardContent className="p-6">
                <Tabs defaultValue="missions">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList>
                      <TabsTrigger value="missions" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Missions</span>
                      </TabsTrigger>
                      <TabsTrigger value="activity" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Activity</span>
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-3">
                      <Link href="/rewards/leaderboard">
                        <motion.button className="btn btn-black flex items-center gap-2 text-sm sm:text-base">
                          <Trophy className="h-4 w-4" />
                          Leaderboard
                          <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <TabsContent value="missions" className="space-y-6">
                      <MissionsGrid
                        missions={effectiveMissionsData?.missions || []}
                        completedMissions={userRewards?.completed_missions || {}}
                        isLoading={isLoadingMissions}
                        pointsSymbol={effectiveMissionsData?.points_symbol || 'SENTINEL'}
                      />
                    </TabsContent>
                    <TabsContent value="activity" className="space-y-6">
                      <RecentActivity
                        activities={userRewards?.recent_activity || []}
                        isLoading={isLoadingUser}
                        pointsSymbol={effectiveMissionsData?.points_symbol || 'SENTINEL'}
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
  )
}
