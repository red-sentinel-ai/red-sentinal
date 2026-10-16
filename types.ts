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
      jury_response?: string
      score: number
    }
  }
  signature: string
}

export type AgentStatus = 'active' | 'defeated'

// Booster Types
export type BoosterTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'DIVINE' | 'CELESTIAL' | 'ETERNAL' | 'TRANSCENDENT'
export type BoosterStatus = 'active' | 'redeemed' | 'expired'

export interface TierInfo {
  name: string
  minReward: number
  maxReward: number
}

/**
 * A Spin Pass. Earned from attacks, sentinel launches, funding, and missions;
 * redeemed on the slot machine for Sentinel Points. Chain-agnostic — passes
 * live in one backend collection and work from any connected wallet.
 */
export interface Booster {
  _id: string
  tier: BoosterTier
  multiplier: number
  source: string
  status: BoosterStatus
  earnedAt: string
  expiresAt: string
  tierInfo?: TierInfo
  redeemedAt?: string
}

export interface BoosterStats {
  active: number
  redeemed: number
  expired: number
  totalEarned: number
}

export interface PassesResponse {
  passes: Booster[]
  stats: BoosterStats
}

export interface SpinStreak {
  currentStreak: number
  streakBonus: number
}

export interface LoyaltyBalanceSummary {
  balance: number
  lifetimePoints: number
}

export interface WalletBalanceEntry {
  walletAddress: string
  chainType: string | null
  balance: number
  lifetimePoints: number
}

export interface LoyaltyBalanceResponse extends LoyaltyBalanceSummary {
  userId: string | null
  walletsByChain: WalletBalanceEntry[]
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
}

export interface SpinResponse {
  success: boolean
  spin: SpinResult
  balance: LoyaltyBalanceSummary
  streak: SpinStreak
  luckyHour: boolean
}

export interface SpinRequest {
  walletAddress: string
  passId: string
  shareToTwitter: boolean
  chain?: string
}

export interface SpinHistoryItem {
  _id: string
  walletAddress: string
  chain?: string | null
  passId: string
  baseAmount: number
  multiplier: number
  finalAmount: number
  streakBonus: number
  luckyHourBonus: number
  shareBonus: number
  firstSpinBonus: boolean
  spunAt: string
}

export interface PassAwarded {
  tier: string
  multiplier: number
  expiresAt: string
  passId: string
}

export interface ClaimLoyaltyResponse {
  claimed: boolean
  passAwarded?: PassAwarded
  pointsAwarded: number
  balance: LoyaltyBalanceSummary
  message?: string
}

export type TemplateOrigin = 'team' | 'community'

export interface SentinelTemplate {
  id?: number
  name: string
  sentinel_type?: 'basic' | 'rag'
  public_instructions: string
  hidden_instructions: string
  attack_goal: string
  avatar_url?: string | null
  origin?: TemplateOrigin
  creator_address?: string | null
  like_count?: number
  comment_count?: number
  liked_by_me?: boolean
}

export interface TemplateComment {
  id: number
  user_address: string
  comment: string
  created_at: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

export interface Chain {
  name: string
  logo: string
  active?: boolean
  rounded?: boolean
}
