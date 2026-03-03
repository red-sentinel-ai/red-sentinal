'use client'

import { useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Loader2, Twitter, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { SlotMachine } from '@/components/slot-machine/SlotMachine'
import { BoostersList } from './BoostersList'
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
    <div className="space-y-8">
      {boostersData?.stats && <BoosterStats stats={boostersData.stats} />}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Spin Your Booster</h2>

            {selectedBooster ? (
              <div className="mb-4 rounded-lg border-2 border-black bg-black p-4 text-white">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">{BOOSTER_TIERS[selectedBooster.tier].color}</span>
                  <div>
                    <h4 className="font-semibold">{BOOSTER_TIERS[selectedBooster.tier].name}</h4>
                    <p className="text-sm text-gray-200">{selectedBooster.multiplier}x Multiplier</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300">
                  Potential: {BOOSTER_TIERS[selectedBooster.tier].minReward.toLocaleString()} -{' '}
                  {BOOSTER_TIERS[selectedBooster.tier].maxReward.toLocaleString()} SENTINEL
                </p>
              </div>
            ) : (
              <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <p className="text-gray-600">Select a booster to spin</p>
              </div>
            )}

            <SlotMachine
              booster={selectedBooster}
              onWin={handleSpinWin}
              shareToTwitter={shareToTwitter}
            />

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="shareTwitter"
                checked={shareToTwitter}
                onChange={e => setShareToTwitter(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="shareTwitter" className="flex items-center gap-1 text-sm text-gray-700">
                <Twitter className="h-4 w-4" />
                Share to Twitter for +100 SENTINEL bonus
              </label>
            </div>

            {lastSpinResult && (
              <div className="mt-4 rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Spin Result</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>Base Amount: {lastSpinResult.spin.baseAmount}</p>
                  <p>Multiplier: {lastSpinResult.spin.multiplier}x</p>
                  {lastSpinResult.spin.streakBonus > 0 && (
                    <p className="text-orange-600">
                      Streak Bonus: +{lastSpinResult.spin.streakBonus}%
                    </p>
                  )}
                  {lastSpinResult.luckyHour && (
                    <p className="text-green-600">
                      Lucky Hour Bonus: +{lastSpinResult.spin.luckyHourBonus}%
                    </p>
                  )}
                  {lastSpinResult.spin.shareBonus > 0 && (
                    <p className="text-blue-600">
                      Share Bonus: +{lastSpinResult.spin.shareBonus} SENTINEL
                    </p>
                  )}
                  <p className="text-lg font-bold">
                    Final Amount: {lastSpinResult.spin.finalAmount.toLocaleString()} SENTINEL
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <BoostersList
            boosters={activeBoosters}
            selectedBooster={selectedBooster}
            onSelectBooster={handleSelectBooster}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <SpinHistory spins={spinHistoryData?.spins || []} isLoading={isLoadingHistory} />
      </div>
    </div>
  )
}
