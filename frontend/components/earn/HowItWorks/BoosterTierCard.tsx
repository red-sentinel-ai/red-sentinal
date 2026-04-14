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
      className="w-full sm:w-56 flex-shrink-0 snap-center"
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
      <Card className="rounded-2xl w-full min-h-[200px] border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)]">
        <CardContent className="w-full flex flex-col items-center justify-center p-4 space-y-3">

          {/* Tier Name */}
          <div className="text-center">
            <h4 className="font-display text-xl font-bold tracking-tight uppercase text-[var(--color-gold-primary)]">
              {tier.name}
            </h4>
            <p className="font-body text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">Spin Pass</p>
          </div>

          <div className="w-full h-px bg-[var(--color-border-subtle)] rounded-full" />

          {/* Stats Section */}
          <div className="flex flex-col items-center w-full space-y-2">

            {/* Multiplier Badge */}
            <div className="font-body inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold-muted)]/30 px-3 py-1 text-xs font-bold text-[var(--color-gold-primary)]">
              {tier.multiplier}x Multiplier
            </div>

            {/* Spin Reward Range */}
            <div className="flex flex-col items-center text-center">
              <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Reward Range</p>
              <p className="font-body text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                {formatNumber(tier.minReward)} - {formatNumber(tier.maxReward)}
              </p>
              <p className="font-body text-[9px] font-bold text-[var(--color-text-faint)]">SENTINEL</p>
            </div>

            <div className="flex w-full items-center justify-center gap-4 pt-1">
              {/* Avg Payout */}
              <div className="flex flex-col items-center">
                <p className="font-body text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Avg</p>
                <p className="font-body text-xs font-bold text-[var(--color-text-secondary)]">
                  ~{formatNumber(avgPayout)}
                </p>
              </div>

              <div className="w-px h-5 bg-[var(--color-border-subtle)]" />

              {/* Validity */}
              <div className="flex flex-col items-center">
                <p className="font-body text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Expires</p>
                <p className="font-body text-xs font-bold text-[var(--color-text-secondary)]">
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
