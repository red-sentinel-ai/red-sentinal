'use client'

import { Award, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { BoosterStats as BoosterStatsType } from '@/types'

interface BoosterStatsProps {
  stats: BoosterStatsType
}

export const BoosterStats = ({ stats }: BoosterStatsProps) => {
  const statCards = [
    {
      label: 'Total Earned',
      value: stats.totalEarned,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Active',
      value: stats.active,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Redeemed',
      value: stats.redeemed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map(stat => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
