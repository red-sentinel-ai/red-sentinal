export type Prompt = {
  prompt: string
  is_success: boolean
  drained_to: string
}

export interface Token {
  address: string
  name: string
  symbol: string
  decimals: number
  image: string
}

export type ConsumePromptApiResponse = {
  response: {
    intent: number
    timestamp_ms: number
    data: {
      agent_id: string
      success: boolean
      agent_response: string
      fun_response: string
      jury_response: string
      score: number
    }
  }
  signature: string
}

export type AgentStatus = 'active' | 'defeated'

// Booster Types
export type BoosterTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'DIVINE' | 'CELESTIAL' | 'ETERNAL' | 'TRANSCENDENT'
export type BoosterStatus = 'active' | 'redeemed' | 'expired'
export type BoosterSource =
  | 'ATTACK_SCORE_0_69'
  | 'ATTACK_SCORE_70_89'
  | 'ATTACK_SCORE_90_99'
  | 'ATTACK_SCORE_100'
  | 'SOCIAL_MISSION'
  | 'QUEST'
  | 'REFERRAL'
  | 'OTHER'

export interface TierInfo {
  name: string
  minReward: number
  maxReward: number
}

export interface Booster {
  _id: string
  tier: BoosterTier
  multiplier: number
  source: BoosterSource
  status: BoosterStatus
  earnedAt: string
  expiresAt: string
  tierInfo: TierInfo
  redeemedAt?: string
}

export interface BoosterStats {
  active: number
  redeemed: number
  expired: number
  totalEarned: number
}

export interface BoostersResponse {
  boosters: Booster[]
  stats: BoosterStats
}

export interface SpinStreak {
  currentStreak: number
  streakBonus: number
}

export interface SpinResult {
  baseAmount: number
  multiplier: number
  boostedAmount: number
  streakBonus: number
  luckyHourBonus: number
  bonusAmount: number
  shareBonus: number
  firstSpinBonus: boolean
  finalAmount: number
  transferDigest: string
}

export interface SpinResponse {
  success: boolean
  spin: SpinResult
  streak: SpinStreak
  luckyHour: boolean
}

export interface SpinRequest {
  walletAddress: string
  boosterId: string
  shareToTwitter: boolean
}

export interface SpinHistoryItem {
  _id: string
  walletAddress: string
  boosterId: string
  baseAmount: number
  multiplier: number
  finalAmount: number
  streakBonus: number
  luckyHourBonus: number
  shareBonus: number
  firstSpinBonus: boolean
  transferDigest: string
  spunAt: string
}

export interface SentinelTemplate {
  name: string
  sentinel_type: 'basic' | 'rag'
  public_instructions: string
  hidden_instructions: string
  attack_goal: string
  avatar_url?: string | null
}

export interface Chain {
  name: string
  logo: string
  active?: boolean
  rounded?: boolean
}