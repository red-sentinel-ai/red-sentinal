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
          width={24}
          height={24}
          alt="twitter"
        />
      )
    case 'join_discord':
    case 'discord_engage':
      return (
        <Image
          src="/icons/discord.svg"
          width={24}
          height={24}
          alt="discord"
        />
      )
    default:
      return <Target className="h-7 w-7 text-blue-400" />
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
        className={`relative transition-all duration-300 bg-[#12121266] backdrop-blur-lg border border-[#444] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 h-full rounded-2xl ${
          isCompleted && isOneTime ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  mission.category === 'on_chain'
                    ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 shadow-blue-500/20'
                    : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-purple-500/20'
                }`}
              >
                {mission.category === 'on_chain' ? (
                  <Zap className="h-8 w-8 text-blue-400" />
                ) : (
                  getSocialMissionIcon(mission.type)
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-white leading-tight font-bold">
                  {mission.name}
                </CardTitle>
              </div>
            </div>
            <Badge className="flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 backdrop-blur-lg rounded-full border border-yellow-500/50 hover:border-yellow-400/70 transition-colors whitespace-nowrap text-yellow-300 font-bold shadow-lg shadow-yellow-500/20">
              +{mission.points} {pointsSymbol}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {isCompleted && isOneTime ? (
                <Badge className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 border border-green-500/50 rounded-full font-semibold shadow-lg shadow-green-500/20">
                  <Check className="h-4 w-4 mr-2" />
                  Completed
                </Badge>
              ) : totalCompletions > 0 ? (
                <Badge className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-300 border border-blue-500/50 rounded-full font-semibold shadow-lg shadow-blue-500/20">
                  <Trophy className="h-4 w-4 mr-2" />
                  {totalCompletions} completed
                </Badge>
              ) : null}
              {isRepeatable && (
                <Badge className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 border border-purple-500/50 rounded-full font-semibold shadow-lg shadow-purple-500/20">
                  <Repeat className="h-4 w-4 mr-2" />
                  Repeatable
                </Badge>
              )}
              {hasLimit && (
                <Badge className="bg-gradient-to-r from-orange-600/30 to-red-600/30 text-orange-300 border border-orange-500/50 rounded-full font-semibold shadow-lg shadow-orange-500/20">
                  <Clock className="h-4 w-4 mr-2" />
                  {mission.max_per_week && `${mission.max_per_week}/week`}
                  {mission.max_per_day && `${mission.max_per_day}/day`}
                </Badge>
              )}
            </div>
            {isSocialMission && !isCompleted && (
              <button
                onClick={handleSocialMissionClick}
                disabled={!address || isProcessing}
                className="w-full border border-blue-500 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-lg py-2 text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-cyan-600/30 hover:border-blue-400 hover:text-blue-200 transition-all duration-300 group flex items-center justify-center gap-3 font-semibold text-md shadow-lg shadow-blue-500/20"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Do Now
                  </>
                )}
              </button>
            )}
          </div>
          {isRepeatable &&
            currentPeriodCompletions > 0 &&
            (mission.max_per_week || mission.max_per_day) && (
              <div className="mt-6 pt-4 border-t border-[#444]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#333] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 shadow-lg"
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
                  <span className="text-sm text-gray-300 font-medium">
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
