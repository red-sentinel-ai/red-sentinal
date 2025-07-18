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
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-[#B8B8B8] uppercase">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-lg bg-[#383838]/30"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <TrendingUp className="h-5 w-5 text-[#558EB4]" />
            </motion.div>
            <div>
              <CardTitle className="text-xl text-[#B8B8B8] uppercase">Recent Activity</CardTitle>
              <p className="text-sm text-[#B5B5B5]">Your latest mission completions</p>
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#383838]/20 to-[#383838]/30 flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-[#B5B5B5]" />
            </div>
            <h3 className="text-lg font-semibold text-[#B8B8B8] mb-2 uppercase">No Activity Yet</h3>
            <p className="text-[#B5B5B5] max-w-sm mx-auto">
              Start completing missions to see your activity history here!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#12121266] backdrop-blur-lg border border-[#383838] rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <TrendingUp className="h-5 w-5 text-[#558EB4]" />
          </motion.div>
          <div>
            <CardTitle className="text-xl text-[#B8B8B8] uppercase">Recent Activity</CardTitle>
            <p className="text-sm text-[#B5B5B5]">Your latest mission completions</p>
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
              <div className="relative flex items-center justify-between p-4 bg-[#12121266] backdrop-blur-lg hover:bg-[#12121280] rounded-lg transition-all duration-300 border border-[#383838] hover:border-[#558EB4]/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-[#8F564E]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">
                      {getMissionName(activity.mission_type)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#383838]/50 text-[#B5B5B5] border border-[#383838] px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.completed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-gradient-to-r from-[#8F564E] to-[#E53922] text-white font-semibold px-3 py-1 rounded-full text-sm">
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
