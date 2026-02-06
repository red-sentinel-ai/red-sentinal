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
  points_display_format?: string
  points_tooltip?: string
}

export interface RewardsConfig {
  enabled: boolean
  missions: RewardsMission[]
  points_name: string
  points_symbol: string
  leaderboard_enabled: boolean
  rewards_message?: string
}

export interface MissionCompletionCounts {
  total: number
  current_period: number
}

export interface LeaderboardEntry {
  user_id: string
  total_points: number
  lifetime_points: number
  tier: string
  rank: number
  username: string | null
  avatar_url: string | null
  wallet_addresses: string[] | null

  twitter_username: string | null
  twitter_user_id: string | null
  twitter_avatar: string | null
  discord_username: string | null
  discord_user_id: string | null
  discord_avatar: string | null
}

export interface RewardEventMetadata {
  agent_id?: string
  amount?: string
  funded_timestamp?: string
  unlock_timestamp?: string
  txDigest?: string
  eventSeq?: string
  sender?: string
  timestampMs?: string
  agent_object_id?: string
  cost_per_message?: string
  creator?: string
  initial_balance?: string
  prompt?: string
}

export interface RewardActivity {
  recipient: string
  description: string
  eventSeq: string
  txDigest: string
  createdAt: string
  eventType: string
  metadata: {
    event: RewardEventMetadata
  }
  rewardAmount: number
  timestampMs: string
  transferDigest?: string
  transferError?: string | null
  transferSuccess?: boolean
  transferUpdatedAt?: string
}

export interface RewardsHistoryResponse {
  result: RewardActivity[]
  total: number
}
