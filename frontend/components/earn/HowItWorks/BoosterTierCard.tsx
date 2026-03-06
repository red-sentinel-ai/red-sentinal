'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui'
import { formatNumber, calculateAveragePayout } from '@/lib/earn-utils'
import { cn } from '@/lib/utils'
import { getTierAsset, getTierStyleConfig, getTierTextConfig } from '@/constants'

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
  const styleClass = getTierStyleConfig(tier.name)
  const textColorClass = getTierTextConfig(tier.name)
  const assetPath = getTierAsset(tier.name)

  return (
    <motion.div
      className="w-full sm:w-64 flex-shrink-0 snap-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.05
      }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn("rounded-2xl w-full min-h-[220px]", styleClass)}>
        <CardContent className="w-full flex flex-col items-center justify-center p-4 space-y-3">
          
          {/* Top Section: Logo and Name */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm"

              transition={{ duration: 0.3 }}
            >
              <Image
                src={assetPath}
                alt={`${tier.name} icon`}
                width={28}
                height={28}
                className="relative object-contain drop-shadow-sm"
              />
            </motion.div>
            
            <div className="text-center">
              <h4 className={cn("text-xl font-black tracking-tight uppercase", textColorClass)}>
                {tier.name}
              </h4>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Spin Pass</p>
            </div>
          </div>

          <div className="w-full h-px bg-black/5 rounded-full" />

          {/* Centered Stats Section */}
          <div className="flex flex-col items-center w-full space-y-2.5">
            
            {/* Multiplier Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black shadow-sm text-gray-800">
              <span className="text-[10px]">⚡</span>
              {tier.multiplier}x Multiplier
            </div>

            {/* Spin Reward Range */}
            <div className="flex flex-col items-center text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Reward Range</p>
              <p className="text-sm font-black text-gray-900 leading-tight">
                {formatNumber(tier.minReward)} - {formatNumber(tier.maxReward)}
              </p>
              <p className="text-[8px] font-bold text-gray-400">SENTINEL</p>
            </div>

            <div className="flex w-full items-center justify-center gap-4 pt-1">
              {/* Avg Payout */}
              <div className="flex flex-col items-center">
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Avg</p>
                <p className="text-xs font-bold text-gray-800">
                  ~{formatNumber(avgPayout)}
                </p>
              </div>
              
              <div className="w-px h-5 bg-black/10" />

              {/* Validity */}
              <div className="flex flex-col items-center">
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Expires</p>
                <p className="text-xs font-bold text-gray-800">
                  {tier.expirationDays}d
                </p>
              </div>
            </div>

          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}


