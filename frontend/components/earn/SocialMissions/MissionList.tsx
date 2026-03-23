'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import type { EarnMission } from '@/types/Earn'
import { EarnMissionCard } from './EarnMissionCard'

interface MissionListProps {
  missions: EarnMission[]
  onMissionSubmit: (mission: EarnMission) => void
}

export function MissionList({ missions, onMissionSubmit }: MissionListProps) {
  const account = useCurrentAccount()

  if (missions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No missions available in this category yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {missions.map(mission => (
        <EarnMissionCard
          key={mission.id}
          mission={mission}
          isAuthenticated={!!account}
          onSubmit={() => onMissionSubmit(mission)}
        />
      ))}
    </div>
  )
}
