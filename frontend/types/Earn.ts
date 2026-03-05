import type { BoosterTier } from './index'

export interface PublicStats {
  totalDistributed: number
  activeMissions: number
  biggestSpinThisWeek: number
}

export type MissionCategory = 'twitter' | 'content' | 'community' | 'referral'
export type MissionSubmissionType = 'url' | 'verify' | 'form'
export type MissionStatus = 'available' | 'pending' | 'completed' | 'limit_reached'

export interface MissionRequirements {
  minCharacters?: number
  maxCharacters?: number
  dailyLimit?: number
  lifetimeLimit?: number
  accountAge?: number
  verificationMethod?: string
  description?: string
}

export interface EarnMission {
  id: string
  title: string
  description: string
  boosterTier: BoosterTier
  multiplier: number
  requirements: MissionRequirements
  rewardRange: { min: number; max: number }
  submissionType: MissionSubmissionType
  category: MissionCategory
  isAutoDetected?: boolean // For viral/mod-triggered missions
  helpText?: string // Additional info for users
}

export interface MissionSubmissionStatus {
  missionId: string
  status: MissionStatus
  submittedAt?: string
  completedAt?: string
  completedCount: {
    today: number
    total: number
  }
}

export interface ReferralStats {
  referred: number
  converted: number
  totalEarned: number
}

export interface ReferralTier {
  level: number
  multiplier: number
  minReferrals: number
  label: string
}

export interface ReferralData {
  referralLink: string
  stats: ReferralStats
  tier: ReferralTier
}

export interface ReferralReward {
  action: string
  userBooster: string
  newUserBooster: string
}

export interface ReferralTierProgress {
  minReferrals: number
  bonus: string
}

export interface AttackerReward {
  action: string
  booster: string
  sentinelRange: string
  notes?: string
}

export interface DefenderReward {
  action: string
  reward: string
}

export interface DurationMultiplier {
  duration: string
  multiplier: string
}

export interface DefenseMultiplier {
  condition: string
  multiplier: string
}

export interface MilestoneBooster {
  milestone: string
  booster: string
  sentinelRange: string
}
