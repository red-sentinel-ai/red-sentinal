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
        <Badge style={{ backgroundColor: 'var(--jp-light-pink)', color: 'var(--jp-orange-color)', borderColor: 'var(--jp-dark-pink)' }}>
          <Clock className="mr-1 h-3 w-3" />
          Under Review
        </Badge>
      )
    if (isCompleted)
      return (
        <Badge style={{ backgroundColor: 'rgba(200, 255, 200, 0.3)', color: '#228B22', borderColor: 'var(--jp-dark-pink)' }}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      )
    if (isLimitReached)
      return (
        <Badge style={{ backgroundColor: 'rgba(200, 200, 200, 0.2)', color: 'var(--jp-gray-color)', borderColor: 'var(--jp-dark-pink)' }}>
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
        className={`jp-card h-full rounded-2xl border transition-all duration-300 hover:shadow-sm ${
          isCompleted || isLimitReached
            ? 'opacity-75'
            : ''
        }`}
        style={{
          backgroundColor: isCompleted || isLimitReached ? 'rgba(235, 188, 189, 0.2)' : 'rgba(251, 231, 231, 0.5)',
          backdropFilter: 'blur(8px)',
          borderColor: 'var(--jp-dark-pink)'
        }}
      >
        <CardContent className="flex flex-col p-5 h-full">
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
          <h4 className="mb-2 text-lg font-bold" style={{ color: 'var(--jp-black-color)' }}>{mission.title}</h4>
          <p className="mb-3 text-sm" style={{ color: 'var(--jp-gray-color)' }}>{mission.description}</p>

          {/* Requirements */}
          {mission.requirements.description && (
            <div className="mb-3 rounded-lg p-3" style={{ backgroundColor: 'rgba(251, 231, 231, 0.4)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--jp-gray-color)' }}>Requirements</p>
              <p className="text-xs" style={{ color: 'var(--jp-black-color)' }}>{mission.requirements.description}</p>
            </div>
          )}

          {/* Reward Range */}
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium" style={{ color: 'var(--jp-gray-color)' }}>Reward Range</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--jp-orange-color)' }}>
              {formatNumber(mission.rewardRange.min)} – {formatNumber(mission.rewardRange.max)}
              <span className="ml-1" style={{ color: 'var(--jp-gray-color)' }}>SENTINEL</span>
            </p>
          </div>


          {/* Help Text for Auto-Detected */}
          {mission.helpText && (
            <div className="mb-4 rounded-lg border p-3" style={{ borderColor: 'var(--jp-dark-pink)', backgroundColor: 'rgba(251, 231, 231, 0.4)' }}>
              <p className="text-xs" style={{ color: 'var(--jp-black-color)' }}>{mission.helpText}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-auto pt-3">
            {!isAuthenticated ? (
              <button
                className="w-full cursor-not-allowed rounded-xl border px-4 py-2 font-medium opacity-60"
                style={{ borderColor: 'var(--jp-dark-pink)', color: 'var(--jp-gray-color)' }}
                disabled
              >
                <Lock className="mr-2 inline h-4 w-4" />
                Connect Wallet to Submit
              </button>
            ) : isAutoDetected ? (
              <button
                className="w-full cursor-not-allowed rounded-xl border px-4 py-2 font-medium"
                style={{ borderColor: 'var(--jp-dark-pink)', color: 'var(--jp-gray-color)' }}
                disabled
              >
                Auto-Detected
              </button>
            ) : isCompleted ? (
              <button
                className="w-full cursor-not-allowed rounded-xl border px-4 py-2 font-medium opacity-60"
                style={{ borderColor: 'var(--jp-dark-pink)', color: 'var(--jp-gray-color)' }}
                disabled
              >
                <CheckCircle className="mr-2 inline h-4 w-4" />
                Already Submitted
              </button>
            ) : isLimitReached ? (
              <button
                className="w-full cursor-not-allowed rounded-xl border px-4 py-2 font-medium opacity-60"
                style={{ borderColor: 'var(--jp-dark-pink)', color: 'var(--jp-gray-color)' }}
                disabled
              >
                Come Back Tomorrow
              </button>
            ) : isPending ? (
              <button
                className="w-full cursor-not-allowed rounded-xl border px-4 py-2 font-medium opacity-60"
                style={{ borderColor: 'var(--jp-dark-pink)', color: 'var(--jp-gray-color)' }}
                disabled
              >
                <Clock className="mr-2 inline h-4 w-4" />
                Under Review
              </button>
            ) : (
              <button
                onClick={onSubmit}
                className="jp-btn-primary w-full rounded-xl px-4 py-2 font-medium transition-transform active:scale-[0.98]"
              >
                <ExternalLink className="mr-2 inline h-4 w-4" />
                Submit Mission
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
