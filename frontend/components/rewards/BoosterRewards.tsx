'use client'

import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Loader2, TrendingUp, Sparkles, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { SlotMachine } from '@/components/slot-machine/SlotMachine'
import { SpinHistory } from './SpinHistory'
import { SpinFeed } from './SpinFeed'
import { useUserBoosters, useSpinHistory } from '@/hooks/rewards/useBoosters'
import { useClaimReward } from '@/hooks/rewards/useClaimReward'
import type { Booster, SpinResponse } from '@/types'
import { BOOSTER_TIERS, SUI_SENTINEL_X_USERNAME, getTierAsset, getTierStyleConfig, getTierTextConfig } from '@/constants'
import Image from 'next/image'

export const BoosterRewards = () => {
  const account = useCurrentAccount()
  const [selectedBooster, setSelectedBooster] = useState<Booster | null>(null)
  const [shareToTwitter, setShareToTwitter] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResponse | null>(null)
  const [passFilter, setPassFilter] = useState<'active' | 'expired'>('active')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: boostersData,
    isLoading: isLoadingBoosters,
    refetch: refetchBoosters,
  } = useUserBoosters(account?.address)
  const { data: spinHistoryData, isLoading: isLoadingHistory } = useSpinHistory(account?.address)
  const { mutateAsync: claimReward } = useClaimReward()

  // Auto-claim pending rewards when component mounts
  useEffect(() => {
    const claimPendingRewards = async () => {
      if (!account?.address) return

      try {
        const result = await claimReward({ recipient: account.address })
        if (result.claimed && result.boosterAwarded) {
          toast.success(
            `🎉 ${result.boosterAwarded.tier} Spin Pass Claimed! ${result.boosterAwarded.multiplier}x Multiplier`,
            { duration: 5000 }
          )
          // Refetch boosters to show the new one
          refetchBoosters()
        }
      } catch {
        // Silent fail - user can manually retry later
        console.log('No pending rewards to claim')
      }
    }

    claimPendingRewards()
  }, [account?.address])

  const activeBoosters = boostersData?.boosters.filter(b => b.status === 'active') || []
  const expiredBoosters = boostersData?.boosters.filter(b => b.status === 'expired') || []
  const displayedBoosters = passFilter === 'active' ? activeBoosters : expiredBoosters

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

  const handleManualRefresh = async () => {
    if (!account?.address || isRefreshing) return

    setIsRefreshing(true)
    try {
      const result = await claimReward({ recipient: account.address })
      if (result.claimed && result.boosterAwarded) {
        toast.success(
          `🎉 ${result.boosterAwarded.tier} Spin Pass Claimed! ${result.boosterAwarded.multiplier}x Multiplier`,
          { duration: 5000 }
        )
        // Refetch boosters to show the new one
        await refetchBoosters()
      } else {
        toast.info('No pending rewards to claim at this time')
      }
    } catch (error) {
      toast.error('Failed to refresh rewards. Please try again.')
      console.error('Manual refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
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
      {/* {boostersData?.stats && <BoosterStats stats={boostersData.stats} />} */}

      {/* Main Layout: Slot Machine + Spin Passes */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Left: Slot Machine Section */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Live Feed Ticker */}
          <SpinFeed />

          <div className="p-6 md:p-8">
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
                  Share to Twitter/X for +100 SENTINEL bonus
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
        </div>

        {/* Right: Spin Passes List */}
        <div className="flex h-[700px] flex-col rounded-xl border border-gray-200 bg-white">
          <div className="flex-shrink-0 border-b border-gray-200 p-4 pb-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Spin Passes</h3>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh to claim pending rewards"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => setPassFilter('active')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  passFilter === 'active'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active ({activeBoosters.length})
              </button>
              <button
                onClick={() => setPassFilter('expired')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  passFilter === 'expired'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Expired ({expiredBoosters.length})
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            {displayedBoosters.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-gray-400" />
                <h4 className="mb-2 text-lg font-semibold">
                  No {passFilter === 'active' ? 'Active' : 'Expired'} Spin Passes
                </h4>
                <p className="text-sm text-gray-600">
                  {passFilter === 'active'
                    ? 'Complete attacks, missions, or social tasks to earn Spin Passes'
                    : 'Expired passes will appear here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayedBoosters.map(booster => {
                  const tierInfo = BOOSTER_TIERS[booster.tier]
                  const isExpiringSoon =
                    new Date(booster.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
                  const isSelected = selectedBooster?._id === booster._id
                  const assetPath = getTierAsset(tierInfo.name)
                  const styleClass = getTierStyleConfig(tierInfo.name)
                  const textColorClass = getTierTextConfig(tierInfo.name)

                  return (
                    <button
                      key={booster._id}
                      onClick={() => passFilter === 'active' && handleSelectBooster(booster)}
                      disabled={passFilter === 'expired'}
                      className={`w-full min-h-[140px] p-3 rounded-2xl transition-all ${
                        passFilter === 'active'
                          ? 'hover:scale-105'
                          : 'cursor-not-allowed opacity-60'
                      } ${
                        isSelected
                          ? 'flex flex-col items-center justify-center text-center relative overflow-hidden border-2 border-black bg-black text-white shadow-lg'
                          : `${styleClass} rounded-2xl`
                      }`}
                    >
                      {/* Logo */}
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm mb-2">
                        <Image
                          src={assetPath}
                          alt={`${tierInfo.name} icon`}
                          width={24}
                          height={24}
                          className="object-contain drop-shadow-sm"
                        />
                      </div>

                      {/* Name */}
                      <h4 className={`text-sm font-black tracking-tight uppercase ${isSelected ? 'text-white' : textColorClass}`}>
                        {tierInfo.name} Pass
                      </h4>

                      {/* Multiplier */}
                      <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-white/90 text-gray-800'}`}>
                        <span>⚡</span>
                        {booster.multiplier}x Booster
                      </div>

                      {/* Range */}
                      <div className="mt-2 text-[10px] font-bold leading-tight">
                        <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>Sentinels: </span>
                        <span className={isSelected ? 'text-white' : 'text-gray-900'}>{tierInfo.minReward.toLocaleString()} - {tierInfo.maxReward.toLocaleString()}</span>
                      </div>

                      {/* Expiration */}
                      <div className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${
                        isExpiringSoon
                          ? isSelected ? 'text-yellow-300' : 'text-red-600'
                          : isSelected ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>
                          {isExpiringSoon && '⚠️ '}
                          {formatDistanceToNow(new Date(booster.expiresAt), { addSuffix: true })}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-black shadow-sm">
                            ✓
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spin History */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <SpinHistory spins={spinHistoryData?.spins || []} isLoading={isLoadingHistory} />
      </div>
    </div>
  )
}

