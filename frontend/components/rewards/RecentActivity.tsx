'use client'

import { Clock, Zap, TrendingUp, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import type { RHRewardsActivity } from '@/types/ravenRewards'

interface RecentActivityProps {
  activities: RHRewardsActivity[]
  isLoading: boolean
  pointsSymbol: string
}

export function RecentActivity({ activities, isLoading, pointsSymbol }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white uppercase text-2xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-xl bg-[#333]/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white uppercase">Recent Activity</CardTitle>
              <p className="text-gray-300">Your latest mission completions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center mx-auto mb-8">
              <Clock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 uppercase">No Activity Yet</h3>
            <p className="text-gray-300 max-w-sm mx-auto text-lg">
              Start completing missions to see your activity history here!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#12121266] backdrop-blur-lg border border-[#444] rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white uppercase">Recent Activity</CardTitle>
            <p className="text-gray-300">Your latest mission completions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative flex items-center justify-between p-6 bg-[#12121266] backdrop-blur-lg hover:bg-[#1a1a1a] rounded-xl transition-all duration-300 border border-[#444] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Zap className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-2 text-lg">
                      {getMissionName(activity.mission_type)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#333]/70 text-gray-300 border border-[#444] px-3 py-1 rounded-full text-sm flex items-center gap-2 font-medium">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.completed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold px-4 py-2 rounded-full text-base shadow-lg shadow-emerald-500/20">
                    +{activity.points_earned} {pointsSymbol}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getMissionName(missionType: RHRewardsActivity['mission_type']): string {
  const names: Record<string, string> = {
    mint_nft: 'Minted an NFT',
    list_nft: 'Listed an NFT',
    complete_trade: 'Completed a trade',
    share_with_hashtag: 'Shared a post with hashtag',
  }
  return (
    names[missionType] || missionType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  )
}
