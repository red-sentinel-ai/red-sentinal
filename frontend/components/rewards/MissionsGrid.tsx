'use client'

import { useState } from 'react'
import { Zap, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RewardsMission, MissionCompletionCounts } from '@/types/Rewards'
import { Skeleton } from '@/components/ui'
import { MissionCard } from './MissionCard'
import { SocialMissionModal } from './SocialMissionModal'

const SUBMITTABLE_SOCIAL_MISSIONS = ['follow_x', 'retweet', 'share_with_hashtag', 'join_telegram']

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
  const [selectedMission, setSelectedMission] = useState<RewardsMission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmitMission = (mission: RewardsMission) => {
    setSelectedMission(mission)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="mb-6 h-8 w-48 bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // const onChainMissions = missions.filter(m => m.category === 'on_chain')
  const socialMissions = missions.filter(m => m.category === 'social_media')

  return (
    <div className="space-y-12">
      {/* {onChainMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Zap className="h-5 w-5 text-black" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold uppercase text-black">On-Chain Missions</h3>
              <p className="text-gray-500">Complete transactions and earn rewards</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      )} */}

      {socialMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="mb-8 flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Users className="h-5 w-5 text-black" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold uppercase text-black">Social Media Missions</h3>
              <p className="text-gray-500">Engage with our community and spread the word</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {socialMissions.map((mission, index) => {
              const completionCounts = completedMissions[mission.type] || DEFAULT_COMPLETION_COUNTS
              const isSubmittable = SUBMITTABLE_SOCIAL_MISSIONS.includes(mission.type)
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
                    onSubmit={isSubmittable ? () => handleSubmitMission(mission) : undefined}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {missions.length === 0 && (
        <motion.div
          className="py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
            <Zap className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold uppercase text-black">No Missions Available</h3>
          <p className="text-gray-500">Check back later for new missions to complete!</p>
        </motion.div>
      )}

      <SocialMissionModal
        mission={selectedMission}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMission(null)
        }}
      />
    </div>
  )
}
