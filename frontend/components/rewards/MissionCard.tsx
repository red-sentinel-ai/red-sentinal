'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Clock, Trophy, Zap, Repeat, Target, ExternalLink, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'

import type { MissionCompletionCounts, RewardsMission } from '@/types/Rewards'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui'
import { SOCIAL_MEDIA_URLS } from '@/constants'
import { useRewardsMissionTracker } from '@/hooks/rewards/useRewardsMissionTracker'

interface MissionCardProps {
  mission: RewardsMission
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
    case 'join_telegram':
    case 'telegram_engage':
      return (
        <Image
          src="/icons/telegram.png"
          width={20}
          height={20}
          alt="telegram"
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
      return <Target className="h-6 w-6 text-primary_blue" />
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
    case 'join_telegram':
      return SOCIAL_MEDIA_URLS.TELEGRAM_JOIN
    case 'telegram_engage':
      return SOCIAL_MEDIA_URLS.TELEGRAM_GENERAL_CHAT_URL
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
    trackJoinedTelegram,
    trackTelegramEngage,
  } = useRewardsMissionTracker()

  const isOneTime = mission.frequency === 'one_time'
  const hasLimit = mission.max_per_week || mission.max_per_day
  const isRepeatable = !isOneTime
  const isSocialMission = mission.category === 'social_media'
  const totalCompletions = completionCounts.total
  const currentPeriodCompletions = completionCounts.current_period

  const getPointsDisplay = () => {
    const format = mission.points_display_format || `+{points} {symbol}`

    const displayText = format
      .replace('{points}', mission.points.toString())
      .replace('{symbol}', pointsSymbol)

    if (mission.points_tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                {displayText} <HelpCircle className="h-3 w-3 opacity-70" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-black border border-gray-700 text-white max-w-xs">
              <p>{mission.points_tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return displayText
  }

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
      }

      switch (mission.type) {
        case 'follow_x':
          trackFollowedOnX('social_mission', metadata)
          break
        case 'retweet':
          trackRetweet('social_mission', metadata)
          break
        case 'share_with_hashtag':
          trackShareWithHashtag('social_mission', metadata)
          break
        case 'join_telegram':
          trackJoinedTelegram('social_mission', metadata)
          break
        case 'telegram_engage':
          trackTelegramEngage('social_mission', metadata)
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
        className={`relative transition-all duration-300 bg-[#12121266] backdrop-blur-lg border border-[#383838] hover:border-primary_blue_50 h-full rounded-2xl flex flex-col ${
          isCompleted && isOneTime ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="p-4">
          <div className="flex items-start justify-between flex-1">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                  mission.category === 'on_chain'
                    ? 'bg-gradient-to-br from-primary_blue_20 to-[#1388D5]/20'
                    : 'bg-gradient-to-br from-primary_pink_20 to-[#E53922]/20'
                }`}
              >
                {mission.category === 'on_chain' ? (
                  <Zap className="h-6 w-6 text-primary_blue" />
                ) : (
                  getSocialMissionIcon(mission.type)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-1">
                  <CardTitle className="text-lg text-white leading-tight">{mission.name}</CardTitle>

                  <Badge className="flex items-center gap-2 px-3 py-1 bg-[#12121266] backdrop-blur-lg rounded-full border border-[#383838] hover:border-primary_blue_50 transition-colors whitespace-nowrap text-primary_blue">
                    {getPointsDisplay()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mt-1 pr-4">{mission.description}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4 flex-grow flex flex-col">
          <div className="flex flex-col gap-y-3 flex-grow mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isCompleted && isOneTime ? (
                <Badge className="bg-primary_pink/20 text-primary_pink border border-primary_pink_light rounded-full">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : totalCompletions > 0 ? (
                <Badge className="bg-primary_blue_20 text-primary_blue border border-primary_blue_30 rounded-full">
                  <Trophy className="h-3 w-3 mr-1" />
                  {totalCompletions} completed
                </Badge>
              ) : null}
              {isRepeatable && (
                <Badge className="bg-primary_pink/20 text-primary_pink_light border border-primary_pink_light rounded-full">
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
            {isSocialMission && (!isOneTime || !isCompleted) && (
              <div className="mt-auto">
                <motion.button
                  onClick={handleSocialMissionClick}
                  disabled={!address || isProcessing}
                  className="w-full border mt-auto border-primary_blue bg-[#12121266] backdrop-blur-lg rounded-lg py-3 text-primary_blue hover:bg-[#1388D5] hover:text-black hover:border-[#1388D5] transition-all duration-300 group flex items-center justify-center gap-2 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Do Now
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {isRepeatable &&
            currentPeriodCompletions > 0 &&
            (mission.max_per_week || mission.max_per_day) && (
              <div className="mt-4 pt-4 border-t border-[#383838]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#383838] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary_blue to-[#1388D5] transition-all duration-500"
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
