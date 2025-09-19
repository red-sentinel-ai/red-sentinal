'use client'

import { Zap, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RewardsMission, MissionCompletionCounts } from '@/types/Rewards'
import { Skeleton } from '@/components/ui'
import { MissionCard } from './MissionCard'

interface MissionsGridProps {
  missions: RewardsMission[]
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
          <Skeleton className="h-8 w-48 mb-6 bg-[#383838]/30" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-64 rounded-xl bg-[#383838]/30"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Zap className="h-5 w-5 text-[#558EB4]" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-[#B8B8B8] uppercase">On-Chain Missions</h3>
              <p className="text-[#B5B5B5]">Complete transactions and earn rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Users className="h-5 w-5 text-[#8F564E]" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-[#B8B8B8] uppercase">Social Media Missions</h3>
              <p className="text-[#B5B5B5]">Engage with our community and spread the word</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#383838]/20 to-[#383838]/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="h-12 w-12 text-[#B5B5B5]" />
          </div>
          <h3 className="text-xl font-semibold text-[#B8B8B8] mb-2 uppercase">
            No Missions Available
          </h3>
          <p className="text-[#B5B5B5]">Check back later for new missions to complete!</p>
        </motion.div>
      )}
    </div>
  )
}
