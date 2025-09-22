import { MissionMetadata } from '@/types/Rewards'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useCompleteMission } from './useCompleteMission'
import { useSocialStatus } from '../profile/useSocialStatus'

export function useRewardsMissionTracker() {
  const { address } = useCurrentAccount()
  const { mutate: completeMission } = useCompleteMission()

  const { data: socialStatus } = useSocialStatus(address || undefined)

  const hasTwitter = socialStatus?.isXConnected || false
  const hasDiscord = socialStatus?.isDiscordConnected || false

  const isAllowed = hasTwitter || hasDiscord

  const trackAttackSentinel = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.ATTACK_SENTINEL,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackLaunchSentinel = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.LAUNCH_SENTINEL,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackFollowedOnX = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.FOLLOW_X,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackRetweet = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.RETWEET,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackShareWithHashtag = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.SHARE_WITH_HASHTAG,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackJoinedTelegram = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.JOIN_TELEGRAM,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackTelegramEngage = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.TELEGRAM_ENGAGE,
      transaction_hash: txHash,
      metadata,
    })
  }

  return {
    trackAttackSentinel,
    trackLaunchSentinel,
    trackFollowedOnX,
    trackRetweet,
    trackShareWithHashtag,
    trackJoinedTelegram,
    trackTelegramEngage,
  }
}
