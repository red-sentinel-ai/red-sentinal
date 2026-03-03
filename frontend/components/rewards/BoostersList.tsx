'use client'

import { Clock, Sparkles } from 'lucide-react'
import { BOOSTER_TIERS } from '@/constants'
import type { Booster } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface BoostersListProps {
  boosters: Booster[]
  selectedBooster: Booster | null
  onSelectBooster: (booster: Booster) => void
}

export const BoostersList = ({ boosters, selectedBooster, onSelectBooster }: BoostersListProps) => {
  if (boosters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-xl font-semibold">No Active Boosters</h3>
        <p className="text-gray-600">
          Complete attacks, missions, or social tasks to earn booster coupons
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Active Boosters ({boosters.length})</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boosters.map(booster => {
          const tierInfo = BOOSTER_TIERS[booster.tier]
          const isExpiringSoon = new Date(booster.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
          const isSelected = selectedBooster?._id === booster._id

          return (
            <button
              key={booster._id}
              onClick={() => onSelectBooster(booster)}
              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all hover:scale-105 ${
                isSelected
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{tierInfo.color}</span>
                    <div>
                      <h4
                        className={`font-semibold ${isSelected ? 'text-white' : tierInfo.textColor}`}
                      >
                        {tierInfo.name}
                      </h4>
                      <p className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                        {booster.multiplier}x Multiplier
                      </p>
                    </div>
                  </div>

                  <div className={`mb-3 text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    Reward Range: {tierInfo.minReward.toLocaleString()} -{' '}
                    {tierInfo.maxReward.toLocaleString()} SENTINEL
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isExpiringSoon
                        ? isSelected
                          ? 'text-yellow-300'
                          : 'text-red-600'
                        : isSelected
                          ? 'text-gray-300'
                          : 'text-gray-500'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {isExpiringSoon && '⚠️ '}
                      Expires {formatDistanceToNow(new Date(booster.expiresAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="absolute right-2 top-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
                    ✓
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
