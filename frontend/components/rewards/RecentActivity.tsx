import { Clock, Zap, TrendingUp, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

import type { RHRewardsActivity } from '@/types/Rewards'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'

interface RecentActivityProps {
  activities: RHRewardsActivity[]
  isLoading: boolean
  pointsSymbol: string
}

export function RecentActivity({ activities, isLoading, pointsSymbol }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl uppercase text-black">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 rounded-lg bg-gray-200" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-gray-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <TrendingUp className="h-5 w-5 text-black" />
            </motion.div>
            <div>
              <CardTitle className="text-xl uppercase text-black">Recent Activity</CardTitle>
              <p className="text-sm text-gray-500">Your latest mission completions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold uppercase text-black">No Activity Yet</h3>
            <p className="mx-auto max-w-sm text-gray-500">
              Start completing missions to see your activity history here!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-transparent !p-0">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <TrendingUp className="h-5 w-5 text-black" />
          </motion.div>
          <div>
            <CardTitle className="text-xl uppercase text-black">Recent Activity</CardTitle>
            <p className="text-sm text-gray-500">Your latest mission completions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                    <Zap className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-black">
                      {getMissionName(activity.mission_type)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.completed_at!), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
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
    attack_sentinel: 'Attacked a Sentinel',
    launch_sentinel: 'Launched a Sentinel',
    fund_sentinel: 'Funded a Sentinel',
    defeat_sentinel: 'Defeated a Sentinel',
    follow_x: 'Followed on X',
    retweet: 'Retweeted a Post',
    share_with_hashtag: 'Shared with Hashtag',
    join_telegram: 'Joined Telegram',
    telegram_engage: 'Engaged in Telegram',
  }
  return names[missionType] || missionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
