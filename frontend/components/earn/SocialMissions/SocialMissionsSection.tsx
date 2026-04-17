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
      setIsCriticalBug(mission.id === 'report_critical')
      setIsBugFormOpen(true)
    } else if (mission.submissionType === 'url') {
      setSelectedMission(mission)
      setIsContentModalOpen(true)
    } else {
      setSelectedMission(mission)
      setIsMissionModalOpen(true)
    }
  }

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
    <section id="missions" className="scroll-mt-20 bg-[var(--color-bg-subtle)] py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2 className="font-display mb-4 text-3xl font-bold uppercase text-[var(--color-text-primary)] sm:text-4xl">
            Missions
          </h2>
          <p className="font-body mx-auto max-w-2xl text-base text-[var(--color-text-secondary)] md:text-lg">
            Attack, defend, create content, and engage with the community to earn Spin Passes
          </p>
        </motion.div>

        <Card className="rounded-2xl border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)]">
          <CardContent className="p-6 md:p-8">
            <MissionTabNav activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'defender' && (
              <div className="mb-6 rounded-lg border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-[var(--color-info)]" />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">Rewards Are Auto-Detected On-Chain</p>
                    <p className="font-body text-sm text-[var(--color-text-secondary)]">
                      Deploy or fund your Sentinel and booster passes are awarded automatically, no submission needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attacker' && (
              <div className="mb-6 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-[var(--color-danger)]" />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">Rewards Are Auto-Detected On-Chain</p>
                    <p className="font-body text-sm text-[var(--color-text-secondary)]">
                      Attack any Sentinel and your booster passes are awarded automatically based on your result.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="mb-6 rounded-lg border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-[var(--color-info)]" />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">
                      Content Submissions Reviewed Within 48 Hours
                    </p>
                    <p className="font-body text-sm text-[var(--color-text-secondary)]">
                      Quality content that accurately represents Sui Sentinel earns Spin Passes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="mb-6 rounded-lg border border-[var(--color-gold-muted)] bg-[var(--color-gold-muted)]/10 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-[var(--color-gold-primary)]" />
                  <div>
                    <p className="font-body font-medium text-[var(--color-text-primary)]">Helpful Telegram Members Rewarded</p>
                    <p className="font-body text-sm text-[var(--color-text-secondary)]">
                      Help others in Discord and our moderators will award you with 2x Uncommon Spin
                      Passes automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <MissionList missions={missions} onMissionSubmit={handleMissionSubmit} />
          </CardContent>
        </Card>
      </div>

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
