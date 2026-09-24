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
      className="w-full flex-shrink-0 snap-center sm:w-56"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay: index * 0.05,
      }}
      whileHover={{ y: -4 }}
    >
      <Card className="min-h-[200px] w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)]">
        <CardContent className="flex w-full flex-col items-center justify-center space-y-3 p-4">
          {/* Tier Name */}
          <div className="text-center">
            <h4 className="font-display text-xl font-bold uppercase tracking-tight text-[var(--color-gold-primary)]">
              {tier.name}
            </h4>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
              Spin Pass
            </p>
          </div>

          <div className="h-px w-full rounded-full bg-[var(--color-border-subtle)]" />

          {/* Stats Section */}
          <div className="flex w-full flex-col items-center space-y-2">
            {/* Multiplier Badge */}
            <div className="font-body bg-[var(--color-gold-muted)]/30 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[var(--color-gold-primary)]">
              {tier.multiplier}x Multiplier
            </div>

            {/* Spin Reward Range */}
            <div className="flex flex-col items-center text-center">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                Reward Range
              </p>
              <p className="font-body text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
                {formatNumber(tier.minReward)} - {formatNumber(tier.maxReward)}
              </p>
              <p className="font-body text-[10px] font-semibold text-[var(--color-text-faint)]">
                SENTINEL
              </p>
            </div>

            <div className="flex w-full items-center justify-center gap-4 pt-1">
              {/* Avg Payout */}
              <div className="flex flex-col items-center">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                  Avg
                </p>
                <p className="font-body text-xs font-semibold text-[var(--color-text-secondary)]">
                  ~{formatNumber(avgPayout)}
                </p>
              </div>

              <div className="h-5 w-px bg-[var(--color-border-subtle)]" />

              {/* Validity */}
              <div className="flex flex-col items-center">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                  Expires
                </p>
                <p className="font-body text-xs font-semibold text-[var(--color-text-secondary)]">
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
