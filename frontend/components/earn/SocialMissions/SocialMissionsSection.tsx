'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { MissionTabNav, type MissionTab } from './MissionTabNav'
import { MissionList } from './MissionList'
// import { ReferralSection } from './ReferralSection'
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
    <section id="missions" className="scroll-mt-20 py-16 md:py-20">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2 className="jp-text-heading mb-4 text-3xl font-bold uppercase sm:text-4xl">
            Missions
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg" style={{ color: 'var(--jp-gray-color)' }}>
            Attack, defend, create content, and engage with the community to earn Spin Passes
          </p>
        </motion.div>

        <Card className="jp-card rounded-2xl" style={{ backgroundColor: 'rgba(251, 231, 231, 0.6)', backdropFilter: 'blur(8px)', borderColor: 'var(--jp-dark-pink)' }}>
          <CardContent className="p-6 md:p-8">
            {/* Tab Navigation */}
            <MissionTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'defender' && (
              <div className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(251, 231, 231, 0.4)' }}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--jp-orange-color)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--jp-black-color)' }}>Rewards Are Auto-Detected On-Chain</p>
                    <p className="text-sm" style={{ color: 'var(--jp-gray-color)' }}>
                      Deploy or fund your Sentinel and booster passes are awarded automatically, no submission needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attacker' && (
              <div className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(235, 188, 189, 0.3)' }}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--jp-red-color)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--jp-black-color)' }}>Rewards Are Auto-Detected On-Chain</p>
                    <p className="text-sm" style={{ color: 'var(--jp-gray-color)' }}>
                      Attack any Sentinel and your booster passes are awarded automatically based on your result.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Review Banner (Content Tab) */}
            {activeTab === 'content' && (
              <div className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(251, 231, 231, 0.4)' }}>
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--jp-orange-color)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--jp-black-color)' }}>
                      Content Submissions Reviewed Within 48 Hours
                    </p>
                    <p className="text-sm" style={{ color: 'var(--jp-gray-color)' }}>
                      Quality content that accurately represents Sui Sentinel earns Spin Passes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mod Reward Info Card (Community Tab) */}
            {activeTab === 'community' && (
              <div className="mb-6 rounded-lg border p-4" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(235, 188, 189, 0.3)' }}>
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--jp-red-color)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--jp-black-color)' }}>Helpful Telegram Members Rewarded</p>
                    <p className="text-sm" style={{ color: 'var(--jp-gray-color)' }}>
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
