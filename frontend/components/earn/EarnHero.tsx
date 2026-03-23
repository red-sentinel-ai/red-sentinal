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
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Target,
      label: 'Active Missions',
      value: stats?.activeMissions || 0,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      format: (val: number) => val.toString(),
    },
    {
      icon: Trophy,
      label: 'Total Spins',
      value: stats?.totalSpins || 0,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      format: (val: number) => val.toLocaleString(),
    },
  ]

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl md:text-5xl">
          Every Action Earns SENTINEL
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base text-gray-600 sm:text-xl md:mb-12">
          Complete missions, defend or attack Sentinels, and create content to earn Spin Passes. Use
          your passes at the slot machine to win{' '}
          <Link
            href={SENTINEL_TOKEN_EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-black underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            SENTINEL tokens
          </Link>
          .
        </p>

        {/* Stats Cards */}
        <Card className="mb-8 rounded-2xl border-gray-200 bg-white md:mb-10">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                const formatValue = stat.format || formatNumber
                const displayValue = isLoading ? '—' : formatValue(stat.value)

                return (
                  <motion.div
                    key={stat.label}
                    className="p-6 md:p-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-center gap-4">
                      <div
                        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${stat.iconBg} md:h-16 md:w-16`}
                      >
                        <Icon className={`h-7 w-7 ${stat.iconColor} md:h-8 md:w-8`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 text-2xl font-bold text-black md:text-3xl">
                          {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          ) : (
                            displayValue
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-500 md:text-base">
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
              className="btn btn-black px-8 py-3 text-base md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Spin Passes
            </motion.button>
          </Link>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="btn btn-black px-8 py-3 text-base md:text-lg">
              Connect Wallet to Start Earning
            </button>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
