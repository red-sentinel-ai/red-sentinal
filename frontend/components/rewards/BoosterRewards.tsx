'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Loader2, Twitter, TrendingUp, Sparkles, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { SlotMachine } from '@/components/slot-machine/SlotMachine'
import { BoosterStats } from './BoosterStats'
import { SpinHistory } from './SpinHistory'
import { useUserBoosters, useSpinHistory } from '@/hooks/rewards/useBoosters'
import type { Booster, SpinResponse } from '@/types'
import { BOOSTER_TIERS, SUI_SENTINEL_X_USERNAME } from '@/constants'

export const BoosterRewards = () => {
  const account = useCurrentAccount()
  const [selectedBooster, setSelectedBooster] = useState<Booster | null>(null)
  const [shareToTwitter, setShareToTwitter] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResponse | null>(null)

  const { data: boostersData, isLoading: isLoadingBoosters } = useUserBoosters(account?.address)
  const { data: spinHistoryData, isLoading: isLoadingHistory } = useSpinHistory(account?.address)

  const activeBoosters = boostersData?.boosters.filter(b => b.status === 'active') || []

  const handleSelectBooster = (booster: Booster) => {
    setSelectedBooster(booster)
    setLastSpinResult(null)
  }

  const handleSpinWin = (spinResponse: SpinResponse) => {
    setLastSpinResult(spinResponse)
    setSelectedBooster(null)

    toast.success(
      <div className="flex flex-col gap-2">
        <p className="font-bold">Spin Successful! 🎉</p>
        <p>You won {spinResponse.spin.finalAmount.toLocaleString()} SENTINEL tokens!</p>
      </div>,
      { duration: 5000 }
    )

    if (shareToTwitter) {
      handleShareToTwitter(spinResponse)
    }
  }

  const handleShareToTwitter = (spinResponse: SpinResponse) => {
    if (!selectedBooster) return

    const tierInfo = BOOSTER_TIERS[selectedBooster.tier]
    const tweetText = encodeURIComponent(
      `🎰 Just spun ${spinResponse.spin.finalAmount.toLocaleString()} SENTINEL on my ${tierInfo.name} booster (${selectedBooster.multiplier}x) on @${SUI_SENTINEL_X_USERNAME}! 🔥 #SuiSentinel #AI #Web3`
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`

    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  if (isLoadingBoosters) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {boostersData?.stats && <BoosterStats stats={boostersData.stats} />}

      {/* Main Layout: Slot Machine + Spin Passes */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Left: Slot Machine Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="mb-16 text-center text-xl font-bold md:text-3xl">Select a Spin Pass</h2>

          <div className="mb-6 py-6 md:py-8 lg:py-12">
            <SlotMachine
              booster={selectedBooster}
              onWin={handleSpinWin}
              shareToTwitter={shareToTwitter}
            />
          </div>

          {selectedBooster ? (
            <div className="mx-auto mb-4 max-w-md rounded-lg border-2 border-black bg-black p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{BOOSTER_TIERS[selectedBooster.tier].color}</span>
                  <div>
                    <h4 className="font-semibold">
                      {BOOSTER_TIERS[selectedBooster.tier].name} Spin Pass
                    </h4>
                    <p className="text-xs text-gray-200">
                      {selectedBooster.multiplier}x Multiplier
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-300">
                  {BOOSTER_TIERS[selectedBooster.tier].minReward.toLocaleString()} -{' '}
                  {BOOSTER_TIERS[selectedBooster.tier].maxReward.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto mb-4 max-w-md rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-center">
              <p className="text-sm text-gray-600">Select a Spin Pass below to start</p>
            </div>
          )}

          <div className="mx-auto max-w-md">
            <div className="mb-4 mt-8 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="shareTwitter"
                checked={shareToTwitter}
                onChange={e => setShareToTwitter(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="shareTwitter"
                className="flex items-center gap-1 text-sm text-gray-700"
              >
                <Twitter className="h-4 w-4" />
                Share to Twitter for +100 SENTINEL bonus
              </label>
            </div>

            {lastSpinResult && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      Won {lastSpinResult.spin.finalAmount.toLocaleString()} SENTINEL
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600">
                    <span>Base: {lastSpinResult.spin.baseAmount}</span>
                    <span>•</span>
                    <span>{lastSpinResult.spin.multiplier}x</span>
                    {lastSpinResult.spin.streakBonus > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600">
                          +{lastSpinResult.spin.streakBonus}% Streak
                        </span>
                      </>
                    )}
                    {lastSpinResult.luckyHour && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">
                          +{lastSpinResult.spin.luckyHourBonus}% Lucky
                        </span>
                      </>
                    )}
                    {lastSpinResult.spin.shareBonus > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">
                          +{lastSpinResult.spin.shareBonus} Share
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Spin Passes List */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold">
            Active Spin Passes ({activeBoosters.length})
          </h3>

          {activeBoosters.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-gray-400" />
              <h4 className="mb-2 text-lg font-semibold">No Active Spin Passes</h4>
              <p className="text-sm text-gray-600">
                Complete attacks, missions, or social tasks to earn Spin Passes
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {activeBoosters.map(booster => {
                  const tierInfo = BOOSTER_TIERS[booster.tier]
                  const isExpiringSoon =
                    new Date(booster.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
                  const isSelected = selectedBooster?._id === booster._id

                  return (
                    <button
                      key={booster._id}
                      onClick={() => handleSelectBooster(booster)}
                      className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <span className="text-xl">{tierInfo.color}</span>
                            <div>
                              <h4
                                className={`text-sm font-semibold ${isSelected ? 'text-white' : tierInfo.textColor}`}
                              >
                                {tierInfo.name} Pass
                              </h4>
                              <p
                                className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}
                              >
                                {booster.multiplier}x
                              </p>
                            </div>
                          </div>

                          <div
                            className={`mb-2 text-[10px] ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}
                          >
                            {tierInfo.minReward.toLocaleString()} -{' '}
                            {tierInfo.maxReward.toLocaleString()}
                          </div>

                          <div
                            className={`flex items-center gap-0.5 text-[10px] ${
                              isExpiringSoon
                                ? isSelected
                                  ? 'text-yellow-300'
                                  : 'text-red-600'
                                : isSelected
                                  ? 'text-gray-300'
                                  : 'text-gray-500'
                            }`}
                          >
                            <Clock className="h-2.5 w-2.5" />
                            <span>
                              {isExpiringSoon && '⚠️ '}
                              {formatDistanceToNow(new Date(booster.expiresAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute right-1.5 top-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-black">
                            ✓
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spin History */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <SpinHistory spins={spinHistoryData?.spins || []} isLoading={isLoadingHistory} />
      </div>
    </div>
  )
}
