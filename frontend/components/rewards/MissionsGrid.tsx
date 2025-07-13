import { Zap, Users } from 'lucide-react'
import type { RavenRewardsMission, MissionCompletionCounts } from '@/types/ravenRewards'
import { Skeleton } from '@/components/ui/skeleton'
import { MissionCard } from './MissionCard'

interface MissionsGridProps {
  missions: RavenRewardsMission[]
  completedMissions: Record<string, MissionCompletionCounts>
  isLoading: boolean
  pointsSymbol: string
}

const DEFAULT_COMPLETION_COUNTS: MissionCompletionCounts = {
  total: 0,
  current_period: 0,
}

export function MissionsGrid({
  missions,
  completedMissions,
  isLoading,
  pointsSymbol,
}: MissionsGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-64 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const onChainMissions = missions.filter((m) => m.category === 'on_chain')
  const socialMissions = missions.filter((m) => m.category === 'social_media')

  return (
    <div className="space-y-12">
      {onChainMissions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">On-Chain Missions</h3>
              <p className="text-gray-400">Complete transactions and earn rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onChainMissions.map((mission) => {
              const completionCounts = completedMissions[mission.type] || DEFAULT_COMPLETION_COUNTS
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  completionCounts={completionCounts} // Pass the new structure
                  pointsSymbol={pointsSymbol}
                  isCompleted={mission.frequency === 'one_time' && completionCounts.total > 0}
                />
              )
            })}
          </div>
        </div>
      )}

      {socialMissions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Social Media Missions</h3>
              <p className="text-gray-400">Engage with our community and spread the word</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialMissions.map((mission) => {
              const completionCounts = completedMissions[mission.type] || DEFAULT_COMPLETION_COUNTS
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  completionCounts={completionCounts}
                  pointsSymbol={pointsSymbol}
                  isCompleted={mission.frequency === 'one_time' && completionCounts.total > 0}
                />
              )
            })}
          </div>
        </div>
      )}

      {missions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Missions Available</h3>
          <p className="text-gray-500">Check back later for new missions to complete!</p>
        </div>
      )}
    </div>
  )
}
