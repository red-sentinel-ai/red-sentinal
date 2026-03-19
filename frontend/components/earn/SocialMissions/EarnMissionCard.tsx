'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Lock, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, Badge } from '@/components/ui'
import { BOOSTER_TIERS } from '@/constants'
import type { EarnMission, MissionStatus } from '@/types/Earn'
import { formatNumber } from '@/lib/earn-utils'

interface EarnMissionCardProps {
  mission: EarnMission
  isAuthenticated: boolean
  userStatus?: MissionStatus
  onSubmit?: () => void
}

export function EarnMissionCard({
  mission,
  isAuthenticated,
  userStatus = 'available',
  onSubmit,
}: EarnMissionCardProps) {
  const tierInfo = BOOSTER_TIERS[mission.boosterTier]
  const isPending = userStatus === 'pending'
  const isCompleted = userStatus === 'completed'
  const isLimitReached = userStatus === 'limit_reached'
  const isAutoDetected = mission.isAutoDetected

  const getStatusBadge = () => {
    if (isPending)
      return (
        <Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />
          Under Review
        </Badge>
      )
    if (isCompleted)
      return (
        <Badge className="border-green-200 bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    if (isLimitReached)
      return (
        <Badge className="border-gray-200 bg-gray-100 text-gray-700">
          <AlertCircle className="mr-1 h-3 w-3" />
          Limit Reached
        </Badge>
      )
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`h-full rounded-2xl border transition-all duration-300 hover:shadow-sm ${
          isCompleted || isLimitReached
            ? 'border-gray-200 bg-gray-50 opacity-75'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <CardContent className="flex flex-col p-5">
          {/* Header: Booster Badge */}
          <div className="mb-4 flex items-start justify-between gap-2">
            <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${tierInfo.bgColor}`}>
              <span className="text-lg">{tierInfo.color}</span>
              <span className={`text-sm font-bold ${tierInfo.textColor}`}>
                {mission.multiplier}x {tierInfo.name}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Title & Description */}
          <h4 className="mb-2 text-lg font-bold text-black">{mission.title}</h4>
          <p className="mb-3 text-sm text-gray-600">{mission.description}</p>

          {/* Requirements */}
          {mission.requirements.description && (
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">Requirements</p>
              <p className="text-xs text-gray-700">{mission.requirements.description}</p>
            </div>
          )}

          {/* Reward Range */}
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-gray-500">Reward Range</p>
            <p className="text-sm font-semibold text-black">
              {formatNumber(mission.rewardRange.min)} – {formatNumber(mission.rewardRange.max)}
              <span className="ml-1 text-gray-500">SENTINEL</span>
            </p>
          </div>


          {/* Help Text for Auto-Detected */}
          {mission.helpText && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-700">{mission.helpText}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-auto pt-3">
            {!isAuthenticated ? (
              <button className="btn btn-outline w-full cursor-not-allowed opacity-60" disabled>
                <Lock className="mr-2 h-4 w-4" />
                Connect Wallet to Submit
              </button>
            ) : isAutoDetected ? (
              <button className="btn btn-outline w-full cursor-not-allowed" disabled>
                Auto-Detected
              </button>
            ) : isCompleted ? (
              <button className="btn btn-outline w-full cursor-not-allowed opacity-60" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Already Submitted
              </button>
            ) : isLimitReached ? (
              <button className="btn btn-outline w-full cursor-not-allowed opacity-60" disabled>
                Come Back Tomorrow
              </button>
            ) : isPending ? (
              <button className="btn btn-outline w-full cursor-not-allowed opacity-60" disabled>
                <Clock className="mr-2 h-4 w-4" />
                Under Review
              </button>
            ) : (
              <button
                onClick={onSubmit}
                className="btn btn-black w-full transition-transform active:scale-[0.98]"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Submit Mission
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
