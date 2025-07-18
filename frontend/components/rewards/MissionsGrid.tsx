'use client'

import { Zap, Users } from 'lucide-react'
import { motion } from 'framer-motion'
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
      <div className="space-y-12">
        <div>
          <Skeleton className="h-10 w-64 mb-8 bg-[#333]/50" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-80 rounded-2xl bg-[#333]/50"
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
    <div className="space-y-16">
      {onChainMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white uppercase">On-Chain Missions</h3>
              <p className="text-gray-300 text-lg">Complete transactions and earn rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {onChainMissions.map((mission, index) => {
              const completionCounts = completedMissions[mission.type] || DEFAULT_COMPLETION_COUNTS
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="h-full"
                >
                  <MissionCard
                    mission={mission}
                    completionCounts={completionCounts}
                    pointsSymbol={pointsSymbol}
                    isCompleted={mission.frequency === 'one_time' && completionCounts.total > 0}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {socialMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white uppercase">Social Media Missions</h3>
              <p className="text-gray-300 text-lg">Engage with our community and spread the word</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialMissions.map((mission, index) => {
              const completionCounts = completedMissions[mission.type] || DEFAULT_COMPLETION_COUNTS
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MissionCard
                    mission={mission}
                    completionCounts={completionCounts}
                    pointsSymbol={pointsSymbol}
                    isCompleted={mission.frequency === 'one_time' && completionCounts.total > 0}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {missions.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center mx-auto mb-8">
            <Zap className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4 uppercase">
            No Missions Available
          </h3>
          <p className="text-gray-300 text-lg">Check back later for new missions to complete!</p>
        </motion.div>
      )}
    </div>
  )
}
