'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { MissionTabNav, type MissionTab } from './MissionTabNav'
import { MissionList } from './MissionList'
import { BugReportForm } from './BugReportForm'
import { SocialMissionModal } from '@/components/rewards/SocialMissionModal'
import { ContentSubmissionModal } from './ContentSubmissionModal'
import { TWITTER_MISSIONS, CONTENT_MISSIONS, COMMUNITY_MISSIONS, DEFENDER_MISSIONS, ATTACKER_MISSIONS } from '@/lib/earn-utils'
import type { EarnMission } from '@/types/Earn'
import type { RewardsMission } from '@/types/Rewards'

export function SocialMissionsSection() {
  const [activeTab, setActiveTab] = useState<MissionTab>('twitter')
  const [selectedMission, setSelectedMission] = useState<EarnMission | null>(null)
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false)
  const [isContentModalOpen, setIsContentModalOpen] = useState(false)
  const [isBugFormOpen, setIsBugFormOpen] = useState(false)
  const [isCriticalBug, setIsCriticalBug] = useState(false)

  const handleMissionSubmit = (mission: EarnMission) => {
    if (mission.submissionType === 'form') {
      // Open bug report form
      setIsCriticalBug(mission.id === 'report_critical')
      setIsBugFormOpen(true)
    } else if (mission.submissionType === 'url') {
      // Open content submission modal for URL-based submissions
      setSelectedMission(mission)
      setIsContentModalOpen(true)
    } else {
      // Open social mission modal for verify submissions (follow_x, join_telegram)
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
      case 'defender':
        return DEFENDER_MISSIONS
      case 'attacker':
        return ATTACKER_MISSIONS
      case 'content':
        return CONTENT_MISSIONS
      case 'community':
        return COMMUNITY_MISSIONS
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
            Missions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Attack, defend, create content, and engage with the community to earn Spin Passes
          </p>
        </motion.div>

        <Card className="rounded-2xl border-gray-200 bg-white">
          <CardContent className="p-6 md:p-8">
            {/* Tab Navigation */}
            <MissionTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'defender' && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Rewards Are Auto-Detected On-Chain</p>
                    <p className="text-sm text-blue-700">
                      Deploy or fund your Sentinel and booster passes are awarded automatically, no submission needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attacker' && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Rewards Are Auto-Detected On-Chain</p>
                    <p className="text-sm text-red-700">
                      Attack any Sentinel and your booster passes are awarded automatically based on your result.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Review Banner (Content Tab) */}
            {activeTab === 'content' && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Content Submissions Reviewed Within 48 Hours
                    </p>
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
                    <p className="font-medium text-purple-900">Helpful Telegram Members Rewarded</p>
                    <p className="text-sm text-purple-700">
                      Help others in Discord and our moderators will award you with 2x Uncommon Spin
                      Passes automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {/* {activeTab === 'referrals' ? (
              <ReferralSection />
            ) : ( */}
            <MissionList missions={missions} onMissionSubmit={handleMissionSubmit} />
            {/* )} */}
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
      <ContentSubmissionModal
        mission={selectedMission}
        isOpen={isContentModalOpen}
        onClose={() => {
          setIsContentModalOpen(false)
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
