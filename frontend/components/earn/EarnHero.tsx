'use client'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Trophy, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Card, CardContent } from '@/components/ui'
import { usePublicStats } from '@/hooks/earn/usePublicStats'
import { formatNumber } from '@/lib/earn-utils'
import { SENTINEL_TOKEN_EXPLORER_URL } from '@/constants'

export function EarnHero() {
  const account = useCurrentAccount()
  const { data: stats, isLoading } = usePublicStats()

  const statCards = [
    {
      icon: TrendingUp,
      label: 'Total SENTINEL Distributed',
      value: stats?.totalDistributed || 0,
      iconBg: 'bg-[var(--color-gold-muted)]',
      iconColor: 'text-[var(--color-gold-primary)]',
    },
    {
      icon: Target,
      label: 'Active Missions',
      value: stats?.activeMissions || 0,
      iconBg: 'bg-[var(--color-success-muted)]',
      iconColor: 'text-[var(--color-success)]',
      format: (val: number) => val.toString(),
    },
    {
      icon: Trophy,
      label: 'Total Spins',
      value: stats?.totalSpins || 0,
      iconBg: 'bg-[var(--color-analysis-gold-faint)]',
      iconColor: 'text-[var(--color-analysis-gold)]',
      format: (val: number) => val.toLocaleString(),
    },
  ]

  return (
    <section className="container mx-auto px-4 py-8 md:py-10">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="page-heading mb-3 text-center">Every Action Earns SENTINEL</h1>
        <p className="page-subheading mx-auto mb-6 text-center md:mb-8">
          Complete missions, defend or attack Sentinels, and create content to earn Spin Passes. Use
          your passes at the slot machine to win{' '}
          <Link
            href={SENTINEL_TOKEN_EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-gold-primary)] underline underline-offset-2 hover:text-[var(--color-gold-light)] transition-opacity"
          >
            SENTINEL tokens
          </Link>
          .
        </p>

        {/* Stats Cards */}
        <Card className="mb-6 rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-card)] md:mb-8">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y divide-[var(--color-border-subtle)] md:grid-cols-3 md:divide-x md:divide-y-0">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                const formatValue = stat.format || formatNumber
                const displayValue = isLoading ? '—' : formatValue(stat.value)

                return (
                  <motion.div
                    key={stat.label}
                    className="p-4 md:p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${stat.iconBg}`}
                      >
                        <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
                          ) : (
                            displayValue
                          )}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        {account ? (
          <Link href="/profile?tab=rewards">
            <motion.button
              className="btn bg-[var(--color-gold-primary)] px-6 py-2 text-sm text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Spin Passes
            </motion.button>
          </Link>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="btn bg-[var(--color-gold-primary)] px-6 py-2 text-sm text-[var(--color-text-on-gold)] hover:bg-[var(--color-gold-light)]">
              Connect Wallet to Start Earning
            </button>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
