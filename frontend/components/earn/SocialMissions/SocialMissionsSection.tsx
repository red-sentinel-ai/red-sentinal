'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { MissionTabNav, type MissionTab } from './MissionTabNav'
import { MissionList } from './MissionList'
import { ReferralSection } from './ReferralSection'
import { BugReportForm } from './BugReportForm'
import { SocialMissionModal } from '@/components/rewards/SocialMissionModal'
import {
  TWITTER_MISSIONS,
  CONTENT_MISSIONS,
  COMMUNITY_MISSIONS,
} from '@/lib/earn-utils'
import type { EarnMission } from '@/types/Earn'
import type { RewardsMission } from '@/types/Rewards'

export function SocialMissionsSection() {
  const [activeTab, setActiveTab] = useState<MissionTab>('twitter')
  const [selectedMission, setSelectedMission] = useState<EarnMission | null>(null)
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false)
  const [isBugFormOpen, setIsBugFormOpen] = useState(false)
  const [isCriticalBug, setIsCriticalBug] = useState(false)

  const handleMissionSubmit = (mission: EarnMission) => {
    if (mission.submissionType === 'form') {
      // Open bug report form
      setIsCriticalBug(mission.id === 'report_critical')
      setIsBugFormOpen(true)
    } else {
      // Open social mission modal for URL/verify submissions
      setSelectedMission(mission)
      setIsMissionModalOpen(true)
    }
  }

  // Convert EarnMission to RewardsMission format for the modal
  const convertedMission: RewardsMission | null = selectedMission
    ? {
        id: selectedMission.id,
        type: selectedMission.id,
        category: selectedMission.category === 'twitter' ? 'social_media' : 'social_media',
        name: selectedMission.title,
        description: selectedMission.description,
        points: selectedMission.rewardRange.max,
        frequency: selectedMission.requirements.lifetimeLimit === 1 ? 'one_time' : 'per_occurrence',
        enabled: true,
      }
    : null

  const getMissionsByTab = () => {
    switch (activeTab) {
      case 'twitter':
        return TWITTER_MISSIONS
      case 'content':
        return CONTENT_MISSIONS
      case 'community':
        return COMMUNITY_MISSIONS
      case 'referrals':
        return []
      default:
        return []
    }
  }

  const missions = getMissionsByTab()

  return (
    <section id="missions" className="scroll-mt-20 bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl">
            Social Missions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Complete social tasks and submit proof to earn Spin Passes with booster multipliers
          </p>
        </motion.div>

        <Card className="rounded-2xl border-gray-200 bg-white">
          <CardContent className="p-6 md:p-8">
            {/* Tab Navigation */}
            <MissionTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content Review Banner (Content Tab) */}
            {activeTab === 'content' && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Content Submissions Reviewed Within 48 Hours</p>
                    <p className="text-sm text-blue-700">
                      Quality content that accurately represents Sui Sentinel earns Spin Passes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mod Reward Info Card (Community Tab) */}
            {activeTab === 'community' && (
              <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Helpful Discord Members Rewarded</p>
                    <p className="text-sm text-purple-700">
                      Help others in Discord and our moderators will award you with 2x Uncommon Spin Passes
                      automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'referrals' ? (
              <ReferralSection />
            ) : (
              <MissionList missions={missions} onMissionSubmit={handleMissionSubmit} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <SocialMissionModal
        mission={convertedMission}
        isOpen={isMissionModalOpen}
        onClose={() => {
          setIsMissionModalOpen(false)
          setSelectedMission(null)
        }}
      />

      <BugReportForm
        isOpen={isBugFormOpen}
        onClose={() => setIsBugFormOpen(false)}
        isCritical={isCriticalBug}
      />
    </section>
  )
}
