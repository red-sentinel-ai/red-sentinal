export interface RewardsMission {
  id: string
  type: string
  category: 'on_chain' | 'social_media'
  name: string
  description: string
  points: number
  frequency: 'per_occurrence' | 'one_time' | 'daily' | 'weekly'
  max_per_week?: number
  max_per_day?: number
  enabled: boolean
  requirements?: Record<string, string | number | boolean>
}

export interface RewardsConfig {
  enabled: boolean
  missions: RewardsMission[]
  points_name: string
  points_symbol: string
  leaderboard_enabled: boolean
  rewards_message?: string
}

export interface RHUser {
  id: string
  wallet_addresses: string[]
  username?: string
  avatar_url?: string
  total_points: number
  lifetime_points: number
  rewards_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  rewards_updated_at: string
  created_at: string
  updated_at: string
}

export interface MissionMetadata {
  collection_id?: string
  token_id?: number
  nft_name?: string
  nft_id?: string
  price?: number
  collection_name?: string
  collection_address?: string
  from_address?: string
  to_address?: string
  walletAddress?: string
  discordHandle?: string
  twitterUserName?: string
  [key: string]: string | number | boolean | undefined
}

export interface RHRewardsActivity {
  id: string
  wallet_address: string
  mission_type: string
  points_earned: number
  transaction_hash?: string
  metadata: MissionMetadata
  completed_at: string
}

export interface CompleteMissionRequest {
  wallet_address: string
  mission_type: string
  transaction_hash?: string
  metadata?: MissionMetadata
}

export interface CompleteMissionResponse {
  success: boolean
  points_earned: number
  new_total: number
  new_tier: string
  user: RHUser
}

export interface MissionCompletionCounts {
  total: number
  current_period: number
}

export interface UserRewardsData {
  user: RHUser
  completed_missions: Record<string, MissionCompletionCounts>
  recent_activity: RHRewardsActivity[]
}

export interface LeaderboardEntry {
  user_id: string
  total_points: number
  lifetime_points: number
  tier: string
  rank: number
  username: string | null
  avatar_url: string | null

  twitter_username: string | null
  twitter_user_id: string | null
  twitter_avatar: string | null
  discord_username: string | null
  discord_user_id: string | null
  discord_avatar: string | null
}
