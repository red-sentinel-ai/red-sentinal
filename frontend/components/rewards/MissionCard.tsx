'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Clock, Trophy, Zap, Repeat, Target, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { SOCIAL_MEDIA_URLS } from '@/constants'
import type { MissionCompletionCounts, RavenRewardsMission } from '@/types/ravenRewards'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRewardsMissionTracker } from '@/hooks/rewards/useRewardsMissionTracker'

interface MissionCardProps {
  mission: RavenRewardsMission
  completionCounts: MissionCompletionCounts
  isCompleted: boolean
  pointsSymbol: string
}

const getSocialMissionIcon = (missionType: string) => {
  switch (missionType) {
    case 'follow_x':
    case 'retweet':
    case 'share_with_hashtag':
      return (
        <Image
          src="/icons/x.png"
          width={20}
          height={20}
          alt="twitter"
        />
      )
    case 'join_discord':
    case 'discord_engage':
      return (
        <Image
          src="/icons/discord.svg"
          width={20}
          height={20}
          alt="discord"
        />
      )
    default:
      return <Target className="h-6 w-6 text-[#558EB4]" />
  }
}

const getSocialMissionUrl = (missionType: string): string | null => {
  switch (missionType) {
    case 'follow_x':
      return SOCIAL_MEDIA_URLS.TWITTER_FOLLOW
    case 'retweet':
      return SOCIAL_MEDIA_URLS.TWITTER_PROFILE
    case 'share_with_hashtag':
      return SOCIAL_MEDIA_URLS.TWITTER_TWEET
    case 'join_discord':
      return SOCIAL_MEDIA_URLS.DISCORD_JOIN
    case 'discord_engage':
      return SOCIAL_MEDIA_URLS.DISCORD_GENERAL_CHAT_URL
    default:
      return null
  }
}

export function MissionCard({
  mission,
  completionCounts,
  isCompleted,
  pointsSymbol,
}: MissionCardProps) {
  const { address } = useCurrentAccount()
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    trackFollowedOnX,
    trackRetweet,
    trackShareWithHashtag,
    trackJoinedDiscord,
    trackDiscordEngage,
  } = useRewardsMissionTracker()

  const isOneTime = mission.frequency === 'one_time'
  const hasLimit = mission.max_per_week || mission.max_per_day
  const isRepeatable = !isOneTime
  const isSocialMission = mission.category === 'social_media'
  const totalCompletions = completionCounts.total
  const currentPeriodCompletions = completionCounts.current_period

  const handleSocialMissionClick = async () => {
    if (!address || isProcessing) return
    const socialUrl = getSocialMissionUrl(mission.type)
    if (!socialUrl) return

    setIsProcessing(true)
    try {
      window.open(socialUrl, '_blank', 'noopener,noreferrer')
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const metadata = {
        walletAddress: address,
        discordHandle: 'placeholder', // TODO: add discord handle from session
        twitterUserName: 'placeholder', // TODO: add twitter handle from session
      }

      switch (mission.type) {
        case 'follow_x':
          trackFollowedOnX('social_mission_txn_hash', metadata)
          break
        case 'retweet':
          trackRetweet('social_mission_txn_hash', metadata)
          break
        case 'share_with_hashtag':
          trackShareWithHashtag('social_mission_txn_hash', metadata)
          break
        case 'join_discord':
          trackJoinedDiscord('social_mission_txn_hash', metadata)
          break
        case 'discord_engage':
          trackDiscordEngage('social_mission_txn_hash', metadata)
          break
      }
    } catch (error) {
      console.error('Error completing social mission:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative transition-all duration-300 bg-[#12121266] backdrop-blur-lg border border-[#383838] hover:border-[#558EB4]/50 h-full rounded-2xl ${
          isCompleted && isOneTime ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  mission.category === 'on_chain'
                    ? 'bg-gradient-to-br from-[#558EB4]/20 to-[#1388D5]/20'
                    : 'bg-gradient-to-br from-[#8F564E]/20 to-[#E53922]/20'
                }`}
              >
                {mission.category === 'on_chain' ? (
                  <Zap className="h-6 w-6 text-[#558EB4]" />
                ) : (
                  getSocialMissionIcon(mission.type)
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-white leading-tight">{mission.name}</CardTitle>
              </div>
            </div>
            <Badge className="flex items-center gap-2 px-4 py-1 bg-[#12121266] backdrop-blur-lg rounded-full border border-[#383838] hover:border-[#558EB4]/30 transition-colors whitespace-nowrap text-[#558EB4]">
              +{mission.points} {pointsSymbol}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isCompleted && isOneTime ? (
                <Badge className="bg-[#8F564E]/20 text-[#8F564E] border border-[#8F564E]/30 rounded-full">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : totalCompletions > 0 ? (
                <Badge className="bg-[#558EB4]/20 text-[#558EB4] border border-[#558EB4]/30 rounded-full">
                  <Trophy className="h-3 w-3 mr-1" />
                  {totalCompletions} completed
                </Badge>
              ) : null}
              {isRepeatable && (
                <Badge className="bg-[#8F564E]/20 text-[#8F564E] border border-[#8F564E]/30 rounded-full">
                  <Repeat className="h-3 w-3 mr-1" />
                  Repeatable
                </Badge>
              )}
              {hasLimit && (
                <Badge className="bg-[#B5B5B5]/20 text-[#B5B5B5] border border-[#B5B5B5]/30 rounded-full">
                  <Clock className="h-3 w-3 mr-1" />
                  {mission.max_per_week && `${mission.max_per_week}/week`}
                  {mission.max_per_day && `${mission.max_per_day}/day`}
                </Badge>
              )}
            </div>
            {isSocialMission && !isCompleted && (
              <motion.button
                onClick={handleSocialMissionClick}
                disabled={!address || isProcessing}
                className="w-full border border-[#558EB4] bg-[#12121266] backdrop-blur-lg rounded-lg py-3 text-[#558EB4] hover:bg-[#1388D5] hover:text-black hover:border-[#1388D5] transition-all duration-300 group flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#558EB4]"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Do Now
                  </>
                )}
              </motion.button>
            )}
          </div>
          {isRepeatable &&
            currentPeriodCompletions > 0 &&
            (mission.max_per_week || mission.max_per_day) && (
              <div className="mt-4 pt-4 border-t border-[#383838]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#383838] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#558EB4] to-[#1388D5] transition-all duration-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (currentPeriodCompletions /
                            (mission.max_per_week || mission.max_per_day || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#B5B5B5]">
                    {currentPeriodCompletions}/{mission.max_per_week || mission.max_per_day}
                    {mission.max_per_week ? ' this week' : ' today'}
                  </span>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
