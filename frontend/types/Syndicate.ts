export interface SyndicateMemberDetail {
  address: string
  is_owner: boolean
  designation: string
  shares: string
  deposited: string
  redeemed: string
  net_deposited: string
  fees_claimed: string
  deposits_count: number
  redemptions_count: number
  equity_share: number
  first_deposit_at: string | null
  last_activity_at: string | null
  username: string | null
  avatar_url: string | null
  twitter_username: string | null
  twitter_avatar: string | null
  discord_username: string | null
  discord_avatar: string | null
}

export interface BackendSyndicate {
  contract_address: string
  owner: string
  name: string
  syndicate_path: string | null
  description: string
  social_link: string | null
  token_address: string
  token_symbol: string
  whitelist_enabled: boolean
  agent_id: string | null
  agent_path: string | null
  // Decimal128 strings (wei). Render with formatTokenAmount + tokenDecimals.
  total_funds: string
  total_shares: string
  total_deposits_count: number
  total_redemptions_count: number
  agent_initial_fund: string
  agent_total_funded: string
  agent_total_withdrawn: string
  agent_last_funded_timestamp?: string | null
  agent_unlock_timestamp?: string | null
  creator_fees_claimed_total: string
  contributor_fees_claimed_total: string
  members: string[]
  members_count: number
  members_detailed?: SyndicateMemberDetail[]
  network: string
  created_at: string
  updated_at: string
}

export type SyndicateModalId =
  | 'fundSentinel'
  | 'withdrawSentinel'
  | 'whitelist'
  | 'visibility'
  | 'deposit'
  | 'redeem'
  | 'claimFees'
  | 'creatorRewards'
