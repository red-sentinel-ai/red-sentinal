import { useState } from 'react'
import Image from 'next/image'

import { Check, Clock, Trophy, Zap, Repeat, Target, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SOCIAL_MEDIA_URLS } from '@/constants'
import { useRewardsMissionTracker } from '@/hooks/rewards/useRewardsMissionTracker'
import type { RavenRewardsMission, MissionCompletionCounts } from '@/types/ravenRewards'
import { useCurrentAccount } from '@mysten/dapp-kit'

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
      return <Target className="h-6 w-6 text-blue-400" />
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
  const account = useCurrentAccount()
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
  const address = account?.address

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
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
      <Card
        className={`relative transition-all duration-300 bg-black/40 border-gray-800 hover:border-primary/50 h-full ${
          isCompleted && isOneTime ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  mission.category === 'on_chain'
                    ? 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                    : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
                }`}
              >
                {mission.category === 'on_chain' ? (
                  <Zap className="h-6 w-6 text-primary" />
                ) : (
                  getSocialMissionIcon(mission.type)
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-white leading-tight">{mission.name}</CardTitle>
              </div>
            </div>
            <span className="bg-gradient-to-r from-primary to-purple-500 text-white font-semibold px-3 py-1 border-none">
              +{mission.points} {pointsSymbol}
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isCompleted && isOneTime ? (
                <span className="bg-green-600/20 text-green-400 border-green-600/30">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </span>
              ) : totalCompletions > 0 ? (
                <span className="bg-primary/10 text-primary border-primary/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  {totalCompletions} completed
                </span>
              ) : null}

              {isRepeatable && (
                <span className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  <Repeat className="h-3 w-3 mr-1" />
                  Repeatable
                </span>
              )}

              {hasLimit && (
                <span className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  <Clock className="h-3 w-3 mr-1" />
                  {mission.max_per_week && `${mission.max_per_week}/week`}
                  {mission.max_per_day && `${mission.max_per_day}/day`}
                </span>
              )}
            </div>

            {isSocialMission && !isCompleted && (
              <button
                onClick={handleSocialMissionClick}
                disabled={!address || isProcessing}
                className="w-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Do Now
                  </>
                )}
              </button>
            )}
          </div>

          {isRepeatable &&
            currentPeriodCompletions > 0 &&
            (mission.max_per_week || mission.max_per_day) && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (currentPeriodCompletions /
                            (mission.max_per_week || mission.max_per_day || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentPeriodCompletions}/{mission.max_per_week || mission.max_per_day}
                    {mission.max_per_week ? ' this week' : ' today'}
                  </span>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
