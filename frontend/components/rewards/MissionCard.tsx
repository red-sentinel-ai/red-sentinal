'use client'

import Image from 'next/image'
import { Check, Trophy, Zap, Repeat, Target, ExternalLink, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

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

interface MissionCardProps {
  mission: RewardsMission
  completionCounts: MissionCompletionCounts
  isCompleted: boolean
  pointsSymbol: string
  onSubmit?: () => void
}

const getSocialMissionIcon = (missionType: string) => {
  switch (missionType) {
    case 'follow_x':
    case 'retweet':
    case 'share_with_hashtag':
      return <Image src="/icons/x_black.png" width={20} height={20} alt="twitter" />
    case 'join_telegram':
      return <Image src="/icons/telegram_black.png" width={20} height={20} alt="telegram" />
    default:
      return <Target className="h-6 w-6 text-black" />
  }
}

export function MissionCard({
  mission,
  completionCounts,
  isCompleted,
  pointsSymbol,
  onSubmit,
}: MissionCardProps) {
  const isOneTime = mission.frequency === 'one_time'
  const isRepeatable = !isOneTime
  const isSocialMission = mission.category === 'social_media'
  const totalCompletions = completionCounts.total

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
              <span className="flex cursor-help items-center gap-1">
                {displayText} <HelpCircle className="h-3 w-3 opacity-70" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border border-gray-700 bg-black text-white">
              <p>{mission.points_tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return displayText
  }

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-sm ${
          isCompleted && isOneTime ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="p-4">
          <div className="flex flex-1 items-start justify-between">
            <div className="flex w-full items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                {mission.category === 'on_chain' ? (
                  <Zap className="h-6 w-6 text-black" />
                ) : (
                  getSocialMissionIcon(mission.type)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-1">
                  <CardTitle className="text-lg leading-tight text-black">{mission.name}</CardTitle>

                  <Badge className="flex items-center gap-2 whitespace-nowrap border border-gray-200 bg-white px-3 py-1 text-black transition-colors">
                    {getPointsDisplay()}
                  </Badge>
                </div>
                <div>
                  <p className="mt-1 pr-4 text-xs text-gray-500">{mission.description}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col px-4 pb-4 pt-0">
          <div className="mt-2 flex flex-grow flex-col gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {isCompleted && isOneTime ? (
                <Badge className="border border-green-200 bg-green-100 text-green-800">
                  <Check className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : totalCompletions > 0 ? (
                <Badge className="border border-blue-200 bg-blue-100 text-blue-800">
                  <Trophy className="mr-1 h-3 w-3" />
                  {totalCompletions} completed
                </Badge>
              ) : null}
              {isRepeatable && (
                <Badge className="border border-purple-200 bg-purple-100 text-purple-800">
                  <Repeat className="mr-1 h-3 w-3" />
                  Repeatable
                </Badge>
              )}
            </div>
            {isSocialMission && (
              <div className="mt-auto">
                {isCompleted && isOneTime ? (
                  <button
                    disabled
                    className="btn btn-outline mt-auto w-full cursor-not-allowed opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Already Submitted
                  </button>
                ) : (
                  <button
                    onClick={onSubmit}
                    className="btn btn-black mt-auto flex w-full items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Submit Mission
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
