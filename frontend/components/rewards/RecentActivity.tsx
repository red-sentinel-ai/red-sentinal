import { Clock, Zap, TrendingUp, Calendar } from 'lucide-react'
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
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
        <Card className="bg-black/30 border-gray-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 rounded-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
        <Card className="bg-black/30 border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
                <p className="text-sm text-gray-400">Your latest mission completions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Activity Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Start completing missions to see your activity history here!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-primary/20 blur-xl -z-10 rounded-xl"></div>
      <Card className="bg-black/30 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
              <p className="text-sm text-gray-400">Your latest mission completions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-lg transition-all duration-300 border border-gray-800 hover:border-green-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">
                        {getMissionName(activity.mission_type)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-800/50 text-gray-400 border-gray-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(activity.completed_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1">
                      +{activity.points_earned} {pointsSymbol}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
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
