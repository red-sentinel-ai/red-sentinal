import type {
  EarnMission,
  AttackerReward,
  DefenderReward,
} from '@/types/Earn'
import { SUI_SENTINEL_APP_URL } from '@/constants'

// Mock Missions Data based on plan.md specification

export const TWITTER_MISSIONS: EarnMission[] = [
  {
    id: 'follow_x',
    title: 'Follow @redsentinel_ai',
    description: 'Follow our X account to earn a Common Spin Pass (1x booster).',
    boosterTier: 'COMMON',
    multiplier: 1,
    requirements: {
      lifetimeLimit: 1,
      verificationMethod: 'OAuth or manual check',
      description: 'Verified account required, one-time mission',
    },
    rewardRange: { min: 100, max: 1000 },
    submissionType: 'verify',
    category: 'twitter',
  },
  {
    id: 'like_tweet',
    title: 'Like Official Tweet',
    description: 'Like any official tweet from @redsentinel_ai to show your support.',
    boosterTier: 'COMMON',
    multiplier: 1,
    requirements: {
      dailyLimit: 3,
      description: 'Must be an official Red Sentinel tweet',
    },
    rewardRange: { min: 100, max: 1000 },
    submissionType: 'url',
    category: 'twitter',
  },
  {
    id: 'repost_tweet',
    title: 'Repost Official Tweet',
    description: 'Repost an official tweet from @redsentinel_ai to help spread the word.',
    boosterTier: 'UNCOMMON',
    multiplier: 2,
    requirements: {
      dailyLimit: 3,
      description: 'Must be an official Red Sentinel tweet',
    },
    rewardRange: { min: 200, max: 2000 },
    submissionType: 'url',
    category: 'twitter',
  },
  {
    id: 'quote_tweet',
    title: 'Quote Tweet with Insight',
    description: 'Quote tweet with your own thoughts and insights about Red Sentinel.',
    boosterTier: 'RARE',
    multiplier: 5,
    requirements: {
      minCharacters: 50,
      dailyLimit: 2,
      description: 'Must include original commentary',
    },
    rewardRange: { min: 500, max: 5000 },
    submissionType: 'url',
    category: 'twitter',
  },
  {
    id: 'tag_friends',
    title: 'Tag 3 Friends',
    description: 'Tag 3 friends in a tweet about Red Sentinel to introduce them to the platform.',
    boosterTier: 'UNCOMMON',
    multiplier: 2,
    requirements: {
      dailyLimit: 1,
      description: 'Tagged accounts must be real and active',
    },
    rewardRange: { min: 200, max: 2000 },
    submissionType: 'url',
    category: 'twitter',
  },
  {
    id: 'create_thread',
    title: 'Create Thread (5+ Tweets)',
    description: 'Create an educational thread about Red Sentinel with at least 5 tweets.',
    boosterTier: 'EPIC',
    multiplier: 10,
    requirements: {
      dailyLimit: 1,
      description: 'Must be educational/informational content',
    },
    rewardRange: { min: 1000, max: 10000 },
    submissionType: 'url',
    category: 'twitter',
  },
  {
    id: 'thread_viral',
    title: 'Thread Goes Viral (1K+ Impressions)',
    description: 'Auto-rewarded when your previously submitted thread reaches 1,000+ impressions.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: {
      description: 'Verified from analytics automatically',
    },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'verify',
    category: 'twitter',
    isAutoDetected: true,
    helpText: 'No submission needed - we track your submitted threads automatically.',
  },
]

export const CONTENT_MISSIONS: EarnMission[] = [
  {
    id: 'short_video',
    title: 'Short Video (< 2 min)',
    description: 'Create a short video showcasing Red Sentinel.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: {
      description: 'Quality production, clear audio/video',
    },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'url',
    category: 'content',
  },
  {
    id: 'long_video',
    title: 'Long Video (5+ min)',
    description: 'Create an in-depth tutorial or walkthrough video.',
    boosterTier: 'MYTHIC',
    multiplier: 50,
    requirements: {
      description: 'Tutorial quality, comprehensive coverage',
    },
    rewardRange: { min: 5000, max: 50000 },
    submissionType: 'url',
    category: 'content',
  },
  {
    id: 'written_article',
    title: 'Written Article',
    description:
      'Write a comprehensive article about Red Sentinel on X, Substack, Medium, or your own blog.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: {
      minCharacters: 800,
      description: 'Published on X/Substack/Medium, 800+ words',
    },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'url',
    category: 'content',
  },
  {
    id: 'viral_content',
    title: 'Viral Content (10K+ Views)',
    description: 'Auto-rewarded when your submitted content reaches 10,000+ views.',
    boosterTier: 'DIVINE',
    multiplier: 100,
    requirements: {
      description: 'Verified metrics from previously submitted content',
    },
    rewardRange: { min: 10000, max: 100000 },
    submissionType: 'verify',
    category: 'content',
    isAutoDetected: true,
    helpText: 'No submission needed - we track your content metrics automatically.',
  },
]

export const COMMUNITY_MISSIONS: EarnMission[] = [
  {
    id: 'join_telegram',
    title: 'Join Telegram',
    description: 'Join the Red Sentinel Telegram group and verify your membership.',
    boosterTier: 'COMMON',
    multiplier: 1,
    requirements: {
      lifetimeLimit: 1,
      description: 'One-time mission',
    },
    rewardRange: { min: 100, max: 1000 },
    submissionType: 'verify',
    category: 'community',
  },
  {
    id: 'report_bug',
    title: 'Report Valid Bug',
    description: 'Report a confirmed bug with clear reproduction steps.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: {
      description: 'Must be confirmed by the team',
    },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'form',
    category: 'community',
  },
  {
    id: 'report_critical',
    title: 'Critical Bug / Security Issue',
    description: 'Report a critical bug or security vulnerability.',
    boosterTier: 'DIVINE',
    multiplier: 100,
    requirements: {
      description: 'Must be confirmed as critical by the team',
    },
    rewardRange: { min: 10000, max: 100000 },
    submissionType: 'form',
    category: 'community',
  },
]

export const ATTACKER_REWARDS: AttackerReward[] = [
  { action: 'Complete any attack', booster: '5x Rare', sentinelRange: '500 – 5,000' },
  {
    action: 'Successful breach (score 100)',
    booster: '15x Epic+',
    sentinelRange: '1,500 – 15,000 + SUI Prize',
  },
  {
    action: 'Streak Breaker (break 14+ day undefeated)',
    booster: '25x Legendary',
    sentinelRange: '2,500 – 25,000',
  },
  {
    action: 'Legend Slayer (break 30+ day undefeated)',
    booster: '50x Mythic',
    sentinelRange: '5,000 – 50,000',
  },
  { action: 'Dynamic', booster: '-', sentinelRange: 'Based on Sentinel Attack Fee and Total Previous Attempt' },
]

export const DEFENDER_DIRECT_REWARDS: DefenderReward[] = [
  { action: 'Deploy a Sentinel', reward: 'Common Spin Pass' },
]

export const DEFENDER_MISSIONS: EarnMission[] = [
  {
    id: 'deploy_sentinel',
    title: 'Deploy a Sentinel',
    description: 'Register your sentinel on-chain and earn a Common Spin Pass.',
    boosterTier: 'COMMON',
    multiplier: 1,
    requirements: { description: 'Deploy via the Defend page' },
    rewardRange: { min: 100, max: 1000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_rare',
    title: 'Fund Your Sentinel',
    description: 'Add any amount to your Sentinel\'s reward pool and earn a Rare Spin Pass.',
    boosterTier: 'RARE',
    multiplier: 5,
    requirements: { description: 'Fund less than $5 USD in a single transaction' },
    rewardRange: { min: 500, max: 5000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_epic',
    title: 'Fund with $5+',
    description: 'Add at least $5 USD worth of tokens to your Sentinel and earn an Epic Spin Pass.',
    boosterTier: 'EPIC',
    multiplier: 10,
    requirements: { description: 'Fund at least $5 USD in a single transaction' },
    rewardRange: { min: 1000, max: 10000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_legendary',
    title: 'Fund with $10+',
    description: 'Add at least $10 USD worth of tokens to your Sentinel and earn a Legendary Spin Pass.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: { description: 'Fund at least $10 USD in a single transaction' },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_mythic',
    title: 'Fund with $25+',
    description: 'Add at least $25 USD worth of tokens to your Sentinel and earn a Mythic Spin Pass.',
    boosterTier: 'MYTHIC',
    multiplier: 50,
    requirements: { description: 'Fund at least $25 USD in a single transaction' },
    rewardRange: { min: 5000, max: 50000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_divine',
    title: 'Fund with $50+',
    description: 'Add at least $50 USD worth of tokens to your Sentinel and earn a Divine Spin Pass.',
    boosterTier: 'DIVINE',
    multiplier: 100,
    requirements: { description: 'Fund at least $50 USD in a single transaction' },
    rewardRange: { min: 10000, max: 100000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_celestial',
    title: 'Fund with $100+',
    description: 'Add at least $100 USD worth of tokens to your Sentinel and earn a Celestial Spin Pass.',
    boosterTier: 'CELESTIAL',
    multiplier: 250,
    requirements: { description: 'Fund at least $100 USD in a single transaction' },
    rewardRange: { min: 25000, max: 250000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_eternal',
    title: 'Fund with $500+',
    description: 'Add at least $500 USD worth of tokens to your Sentinel and earn an Eternal Spin Pass.',
    boosterTier: 'ETERNAL',
    multiplier: 500,
    requirements: { description: 'Fund at least $500 USD in a single transaction' },
    rewardRange: { min: 50000, max: 500000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
  {
    id: 'fund_sentinel_transcendent',
    title: 'Fund with $1,000+',
    description: 'Add at least $1,000 USD worth of tokens to your Sentinel and earn a Transcendent Spin Pass.',
    boosterTier: 'TRANSCENDENT',
    multiplier: 1000,
    requirements: { description: 'Fund at least $1,000 USD in a single transaction' },
    rewardRange: { min: 100000, max: 1000000 },
    submissionType: 'verify',
    category: 'defender',
    isAutoDetected: true,
  },
]

export const ATTACKER_MISSIONS: EarnMission[] = [
  {
    id: 'attack_complete',
    title: 'Attack Any Sentinel',
    description: 'Send a prompt to any Sentinel and earn a Rare Spin Pass just for trying.',
    boosterTier: 'RARE',
    multiplier: 5,
    requirements: { description: 'Any attack attempt counts, win or lose' },
    rewardRange: { min: 500, max: 5000 },
    submissionType: 'verify',
    category: 'attacker',
    isAutoDetected: true,
  },
  {
    id: 'attack_breach',
    title: 'Breach a Sentinel',
    description: 'Score 100 on an attack to breach the Sentinel and earn an Epic Spin Pass plus the SUI prize pool.',
    boosterTier: 'EPIC',
    multiplier: 15,
    requirements: { description: 'Achieve a perfect score of 100 on your attack' },
    rewardRange: { min: 1500, max: 15000 },
    submissionType: 'verify',
    category: 'attacker',
    isAutoDetected: true,
  },
  {
    id: 'attack_streak_breaker',
    title: 'Streak Breaker',
    description: 'Break a Sentinel that has survived 14 or more consecutive days undefeated.',
    boosterTier: 'LEGENDARY',
    multiplier: 25,
    requirements: { description: 'Target Sentinel must have a 14+ day unbroken streak' },
    rewardRange: { min: 2500, max: 25000 },
    submissionType: 'verify',
    category: 'attacker',
    isAutoDetected: true,
  },
  {
    id: 'attack_legend_slayer',
    title: 'Legend Slayer',
    description: 'Take down a Sentinel that has survived 30 or more consecutive days undefeated.',
    boosterTier: 'MYTHIC',
    multiplier: 50,
    requirements: { description: 'Target Sentinel must have a 30+ day unbroken streak' },
    rewardRange: { min: 5000, max: 50000 },
    submissionType: 'verify',
    category: 'attacker',
    isAutoDetected: true,
  },
]

export const ACTIVE_MISSIONS_COUNT =
  TWITTER_MISSIONS.length +
  CONTENT_MISSIONS.length +
  COMMUNITY_MISSIONS.length +
  DEFENDER_MISSIONS.length +
  ATTACKER_MISSIONS.length

export const DEFENDER_FUNDING_BOOSTERS = [
  { minUsd: '$0',       minUsdValue: 0,    tier: 'RARE',          booster: 'Rare (5x)',              range: '500 – 5,000' },
  { minUsd: '$5',       minUsdValue: 5,    tier: 'EPIC',          booster: 'Epic (10x)',             range: '1,000 – 10,000' },
  { minUsd: '$10',      minUsdValue: 10,   tier: 'LEGENDARY',     booster: 'Legendary (25x)',        range: '2,500 – 25,000' },
  { minUsd: '$25',      minUsdValue: 25,   tier: 'MYTHIC',        booster: 'Mythic (50x)',           range: '5,000 – 50,000' },
  { minUsd: '$50',      minUsdValue: 50,   tier: 'DIVINE',        booster: 'Divine (100x)',          range: '10,000 – 100,000' },
  { minUsd: '$100',     minUsdValue: 100,  tier: 'CELESTIAL',     booster: 'Celestial (250x)',       range: '25,000 – 250,000' },
  { minUsd: '$500',     minUsdValue: 500,  tier: 'ETERNAL',       booster: 'Eternal (500x)',         range: '50,000 – 500,000' },
  { minUsd: '$1,000',   minUsdValue: 1000, tier: 'TRANSCENDENT',  booster: 'Transcendent (1000x)',   range: '100,000 – 1,000,000' },
] as const

export function getDefenderBoosterTier(amountInUsd: number): string {
  const sorted = [...DEFENDER_FUNDING_BOOSTERS].sort((a, b) => b.minUsdValue - a.minUsdValue)
  for (const row of sorted) {
    if (amountInUsd >= row.minUsdValue) return row.tier
  }
  return 'RARE'
}

// Streak bonus data
export const DAILY_STREAK_BONUSES = [
  { days: 1, bonus: 0 },
  { days: 2, bonus: 5 },
  { days: 3, bonus: 10 },
  { days: 7, bonus: 25 },
  { days: 14, bonus: 35 },
  { days: 30, bonus: 50 },
]

// Generate referral link (mock - will be replaced with API)
export function generateReferralLink(walletAddress: string): string {
  const shortAddress = walletAddress.slice(0, 6)
  return `${SUI_SENTINEL_APP_URL}?ref=${shortAddress}`
}

// Format large numbers for display
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

// Calculate average payout for a booster tier
export function calculateAveragePayout(min: number, max: number): number {
  return Math.round((min + max) / 2)
}
