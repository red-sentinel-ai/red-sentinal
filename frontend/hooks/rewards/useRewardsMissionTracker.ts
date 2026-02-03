import { MissionMetadata } from '@/types/Rewards'
import { REWARDS_CONSTANTS } from '@/constants/rewards'
import { useCompleteMission } from './useCompleteMission'
import { useUnifiedWallet } from '../useUnifiedWallet'

export function useRewardsMissionTracker() {
  const { address } = useUnifiedWallet()

  const { mutate: completeMission } = useCompleteMission()

  const trackAttackSentinel = (
    txHash: string,
    attackFeeSui: number,
    previousAttempts: number,
    isWinner: boolean,
    metadata?: MissionMetadata
  ) => {
    if (!address) return

    // Calculate dynamic points for the attack itself: 1 + floor(fee * 20) + previous attempts
    const basePoints = 1
    const feeBonus = Math.floor(attackFeeSui * 20)
    const attemptBonus = previousAttempts
    const totalAttackPoints = basePoints + feeBonus + attemptBonus

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.ATTACK_SENTINEL,
      transaction_hash: txHash,
      points_to_award: totalAttackPoints,
      metadata,
    })

    if (isWinner) {
      completeMission({
        wallet_address: address,
        mission_type: REWARDS_CONSTANTS.MISSION_TYPES.DEFEAT_SENTINEL,
        transaction_hash: txHash,
        metadata,
      })
    }
  }

  const trackLaunchSentinel = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.LAUNCH_SENTINEL,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackFundSentinel = (txHash: string, amountInSui: number, metadata?: MissionMetadata) => {
    if (!address) return

    const pointsToAward = Math.floor(25 * amountInSui)

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.FUND_SENTINEL,
      transaction_hash: txHash,
      points_to_award: pointsToAward,
      metadata: { ...metadata, funded_amount_sui: amountInSui },
    })
  }

  const trackFollowedOnX = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return
    // if (!hasTwitter) {
    //   toast.error('Please connect your X (Twitter) account first.')
    //   return
    // }

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.FOLLOW_X,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackRetweet = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return
    // if (!hasTwitter) {
    //   toast.error('Please connect your X (Twitter) account first.')
    //   return
    // }

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.RETWEET,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackShareWithHashtag = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return
    // if (!hasTwitter) {
    //   toast.error('Please connect your X (Twitter) account first.')
    //   return
    // }

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.SHARE_WITH_HASHTAG,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackJoinedTelegram = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.JOIN_TELEGRAM,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackTelegramEngage = (txHash: string, metadata?: MissionMetadata) => {
    if (!address) return

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
    trackFundSentinel,
    trackFollowedOnX,
    trackRetweet,
    trackShareWithHashtag,
    trackJoinedTelegram,
    trackTelegramEngage,
  }
}
