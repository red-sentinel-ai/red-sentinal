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
      <Card className="bg-white border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-black uppercase">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-gray-50 border border-gray-200 rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <TrendingUp className="h-5 w-5 text-black" />
            </motion.div>
            <div>
              <CardTitle className="text-xl text-black uppercase">Recent Activity</CardTitle>
              <p className="text-sm text-gray-500">Your latest mission completions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 border border-gray-200">
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2 uppercase">No Activity Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Start completing missions to see your activity history here!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none !p-0 bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <TrendingUp className="h-5 w-5 text-black" />
          </motion.div>
          <div>
            <CardTitle className="text-xl text-black uppercase">Recent Activity</CardTitle>
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
              <div className="relative flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <Zap className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {getMissionName(activity.mission_type)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.completed_at!), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-sm border border-green-200">
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
  return (
    names[missionType] || missionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  )
}
