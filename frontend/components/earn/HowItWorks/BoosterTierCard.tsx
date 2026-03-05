'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui'
import { formatNumber, calculateAveragePayout } from '@/lib/earn-utils'

interface BoosterTierInfo {
  name: string
  multiplier: number
  minReward: number
  maxReward: number
  color: string
  bgColor: string
  textColor: string
  expirationDays: number
}

interface BoosterTierCardProps {
  tier: BoosterTierInfo
  index: number
}

export function BoosterTierCard({ tier, index }: BoosterTierCardProps) {
  const avgPayout = calculateAveragePayout(tier.minReward, tier.maxReward)

  return (
    <motion.div
      className="w-64 flex-shrink-0 snap-center"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="h-full rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-md">
        <CardContent className="flex flex-col p-5">
          {/* Tier Color & Name */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">{tier.color}</span>
            <h4 className="text-lg font-bold text-black">{tier.name} Spin Pass</h4>
          </div>

          {/* Multiplier Badge */}
          <div className={`mb-3 inline-flex w-fit rounded-lg px-3 py-1.5 ${tier.bgColor}`}>
            <span className={`text-sm font-bold ${tier.textColor}`}>
              {tier.multiplier}x Booster
            </span>
          </div>

          {/* Spin Range */}
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Spin Range</p>
            <p className="text-sm font-semibold text-black">
              {formatNumber(tier.minReward)} – {formatNumber(tier.maxReward)}
              <span className="ml-1 text-gray-500">SENTINEL</span>
            </p>
          </div>

          {/* Average Payout */}
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Average Payout</p>
            <p className="text-sm font-semibold text-black">
              ~{formatNumber(avgPayout)}
              <span className="ml-1 text-gray-500">SENTINEL</span>
            </p>
          </div>

          {/* Expiration */}
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Expiration</p>
            <p className="text-sm font-semibold text-black">{tier.expirationDays} days</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
