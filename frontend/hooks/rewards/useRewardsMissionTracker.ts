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

  const trackMintNFT = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.MINT_NFT,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackMintNFTPublic = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.MINT_NFT_PUBLIC,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackMintNFTPrivate = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.MINT_NFT_PRIVATE,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackListNFT = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.LIST_NFT,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackPurchaseNFT = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.PURCHASE_NFT,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackCreateOffer = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.CREATE_OFFER,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackAcceptOffer = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.ACCEPT_OFFER,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackTransferNFTPrivate = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.TRANSFER_NFT_PRIVATE,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackTransferNFTPublic = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.TRANSFER_NFT_PUBLIC,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackCompleteTrade = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.COMPLETE_TRADE,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackLaunchCollection = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.LAUNCH_COLLECTION,
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

  const trackJoinedDiscord = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.JOIN_DISCORD,
      transaction_hash: txHash,
      metadata,
    })
  }

  const trackDiscordEngage = (txHash: string, metadata?: MissionMetadata) => {
    if (!address || !isAllowed) return

    completeMission({
      wallet_address: address,
      mission_type: REWARDS_CONSTANTS.MISSION_TYPES.DISCORD_ENGAGE,
      transaction_hash: txHash,
      metadata,
    })
  }

  return {
    trackMintNFT,
    trackListNFT,
    trackMintNFTPublic,
    trackMintNFTPrivate,
    trackPurchaseNFT,
    trackCreateOffer,
    trackAcceptOffer,
    trackTransferNFTPublic,
    trackTransferNFTPrivate,
    trackCompleteTrade,
    trackLaunchCollection,
    trackFollowedOnX,
    trackRetweet,
    trackShareWithHashtag,
    trackJoinedDiscord,
    trackDiscordEngage,
  }
}
