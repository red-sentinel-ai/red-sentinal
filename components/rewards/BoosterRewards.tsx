'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, Sparkles, Clock, RefreshCw } from 'lucide-react'
import { toast } from '@/lib/toast'
import { formatDistanceToNow } from 'date-fns'
import { SlotMachine } from '@/components/slot-machine/SlotMachine'
import { SpinHistory } from './SpinHistory'
import { SpinFeed } from './SpinFeed'
import { useUserPasses, useSpinHistory, useLoyaltyBalance } from '@/hooks/rewards/useBoosters'
import { useClaimReward } from '@/hooks/rewards/useClaimReward'
import { useConnectedAddress } from '@/hooks/useConnectedAddress'
import type { Booster, SpinResponse } from '@/types'
import {
  BOOSTER_TIERS,
  SUI_SENTINEL_X_USERNAME,
  getTierAsset,
  getTierStyleConfig,
  getTierTextConfig,
} from '@/constants'
import Image from 'next/image'

export const BoosterRewards = () => {
  const { address: connectedAddress } = useConnectedAddress()
  const [selectedBooster, setSelectedBooster] = useState<Booster | null>(null)
  const [shareToTwitter, setShareToTwitter] = useState(false)
  const [lastSpinResult, setLastSpinResult] = useState<SpinResponse | null>(null)
  const [passFilter, setPassFilter] = useState<'active' | 'expired'>('active')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: passesData,
    isLoading: isLoadingPasses,
    refetch: refetchPasses,
  } = useUserPasses(connectedAddress)
  const { data: balanceData } = useLoyaltyBalance(connectedAddress)
  const { data: spinHistoryData, isLoading: isLoadingHistory } = useSpinHistory(connectedAddress)
  const { mutateAsync: claimReward } = useClaimReward()

  useEffect(() => {
    const claimPendingRewards = async () => {
      if (!connectedAddress) return

      try {
        const result = await claimReward({ recipient: connectedAddress })
        if (result.claimed && result.passAwarded) {
          toast.success(
            <div className="flex flex-col gap-1">
              <p className="font-bold">
                🎉 {result.passAwarded.tier} Spin Pass Claimed! {result.passAwarded.multiplier}x Multiplier
              </p>
              {result.pointsAwarded > 0 && (
                <p className="text-sm">+{result.pointsAwarded.toLocaleString()} Sentinel Points</p>
              )}
            </div>,
            { duration: 5000 }
          )
          refetchPasses()
        }
      } catch {
        console.log('No pending rewards to claim')
      }
    }

    claimPendingRewards()
  }, [connectedAddress, claimReward, refetchPasses])

  const activePasses = passesData?.passes.filter(b => b.status === 'active') || []
  const expiredPasses = passesData?.passes.filter(b => b.status === 'expired') || []
  const displayedPasses = passFilter === 'active' ? activePasses : expiredPasses

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
        <p>You won {spinResponse.spin.finalAmount.toLocaleString()} Sentinel Points!</p>
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
      `🎰 Just won ${spinResponse.spin.finalAmount.toLocaleString()} Sentinel Points on my ${tierInfo.name} Spin Pass (${selectedBooster.multiplier}x) on @${SUI_SENTINEL_X_USERNAME}! 🔥 #RedSentinel #AI #Web3`
    )
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`

    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const handleManualRefresh = async () => {
    if (!connectedAddress || isRefreshing) return

    setIsRefreshing(true)
    try {
      const result = await claimReward({ recipient: connectedAddress })
      if (result.claimed && result.passAwarded) {
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-bold">
              🎉 {result.passAwarded.tier} Spin Pass Claimed! {result.passAwarded.multiplier}x Multiplier
            </p>
            {result.pointsAwarded > 0 && (
              <p className="text-sm">+{result.pointsAwarded.toLocaleString()} Sentinel Points</p>
            )}
          </div>,
          { duration: 5000 }
        )
        await refetchPasses()
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

  if (isLoadingPasses) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-gold-primary)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sentinel Points balance — aggregated across all wallets linked to this user */}
      {balanceData && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-gold-primary)]/10 text-xl">
              🎯
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                Sentinel Points
              </p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {balanceData.balance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Lifetime earned
            </p>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              {balanceData.lifetimePoints.toLocaleString()} pts
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Left: Slot Machine Section */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <SpinFeed />

          <div className="p-6 md:p-8">
            <h2 className="mb-16 text-center text-xl font-bold text-[var(--color-text-primary)] md:text-3xl">
              Select a Spin Pass
            </h2>

            <div className="mb-6 py-6 md:py-8 lg:py-12">
              <SlotMachine
                booster={selectedBooster}
                onWin={handleSpinWin}
                shareToTwitter={shareToTwitter}
              />
            </div>

            {selectedBooster ? (
              <div className="mx-auto mb-4 max-w-md rounded-lg border-2 border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] p-3 text-[var(--color-text-on-gold)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{BOOSTER_TIERS[selectedBooster.tier].color}</span>
                    <div>
                      <h4 className="font-semibold">
                        {BOOSTER_TIERS[selectedBooster.tier].name} Spin Pass
                      </h4>
                      <p className="text-[var(--color-text-on-gold)]/80 text-xs">
                        {selectedBooster.multiplier}x Multiplier
                      </p>
                    </div>
                  </div>
                  <div className="text-[var(--color-text-on-gold)]/70 text-right text-xs">
                    {BOOSTER_TIERS[selectedBooster.tier].minReward.toLocaleString()} -{' '}
                    {BOOSTER_TIERS[selectedBooster.tier].maxReward.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto mb-4 max-w-md rounded-lg border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] p-3 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Select a Spin Pass below to start
                </p>
              </div>
            )}

            <div className="mx-auto max-w-md">
              <div className="mb-4 mt-8 flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="shareTwitter"
                  checked={shareToTwitter}
                  onChange={e => setShareToTwitter(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border-default)]"
                />
                <label
                  htmlFor="shareTwitter"
                  className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]"
                >
                  Share to Twitter/X for +100 Sentinel Points bonus
                </label>
              </div>

              {lastSpinResult && (
                <div className="rounded-lg border border-[var(--color-success-muted)] bg-[var(--color-success-muted)] p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[var(--color-success)]">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Won {lastSpinResult.spin.finalAmount.toLocaleString()} Sentinel Points
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                      <span>Base: {lastSpinResult.spin.baseAmount}</span>
                      <span>•</span>
                      <span>{lastSpinResult.spin.multiplier}x</span>
                      {lastSpinResult.spin.streakBonus > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--color-warning)]">
                            +{lastSpinResult.spin.streakBonus}% Streak
                          </span>
                        </>
                      )}
                      {lastSpinResult.luckyHour && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--color-success)]">
                            +{lastSpinResult.spin.luckyHourBonus}% Lucky
                          </span>
                        </>
                      )}
                      {lastSpinResult.spin.shareBonus > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--color-info)]">
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
        <div className="flex h-[700px] flex-col rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <div className="flex-shrink-0 border-b border-[var(--color-border-subtle)] p-4 pb-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Spin Passes
              </h3>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh to claim pending rewards"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
              </button>
            </div>

            <div className="flex gap-1 border-b border-[var(--color-border-subtle)]">
              <button
                onClick={() => setPassFilter('active')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  passFilter === 'active'
                    ? 'border-b-2 border-[var(--color-gold-primary)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                Active ({activePasses.length})
              </button>
              <button
                onClick={() => setPassFilter('expired')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  passFilter === 'expired'
                    ? 'border-b-2 border-[var(--color-gold-primary)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                Expired ({expiredPasses.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {displayedPasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-default)] p-8 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
                <h4 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  No {passFilter === 'active' ? 'Active' : 'Expired'} Spin Passes
                </h4>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {passFilter === 'active'
                    ? 'Complete attacks, missions, or social tasks to earn Spin Passes'
                    : 'Expired passes will appear here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayedPasses.map(booster => {
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
                      className={`min-h-[140px] w-full rounded-2xl p-3 transition-all ${
                        passFilter === 'active'
                          ? 'hover:scale-105'
                          : 'cursor-not-allowed opacity-60'
                      } ${
                        isSelected
                          ? 'relative flex flex-col items-center justify-center overflow-hidden border-2 border-[var(--color-gold-primary)] bg-[var(--color-gold-primary)] text-center text-[var(--color-text-on-gold)] shadow-lg'
                          : `${styleClass} rounded-2xl`
                      }`}
                    >
                      <div className="bg-[var(--color-bg-surface)]/80 relative mb-2 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm backdrop-blur-sm">
                        <Image
                          src={assetPath}
                          alt={`${tierInfo.name} icon`}
                          width={24}
                          height={24}
                          className="object-contain drop-shadow-sm"
                        />
                      </div>

                      <h4
                        className={`text-sm font-semibold uppercase tracking-tight ${isSelected ? 'text-[var(--color-text-on-gold)]' : textColorClass}`}
                      >
                        {tierInfo.name} Pass
                      </h4>

                      <div
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${isSelected ? 'bg-[var(--color-bg-surface)]/20 text-[var(--color-text-on-gold)]' : 'bg-[var(--color-bg-surface)]/90 text-[var(--color-text-secondary)]'}`}
                      >
                        <span>⚡</span>
                        {booster.multiplier}x Booster
                      </div>

                      <div className="mt-2 text-[11px] font-semibold leading-tight">
                        <span
                          className={
                            isSelected
                              ? 'text-[var(--color-text-on-gold)]/70'
                              : 'text-[var(--color-text-muted)]'
                          }
                        >
                          Points:{' '}
                        </span>
                        <span
                          className={
                            isSelected
                              ? 'text-[var(--color-text-on-gold)]'
                              : 'text-[var(--color-text-primary)]'
                          }
                        >
                          {tierInfo.minReward.toLocaleString()} -{' '}
                          {tierInfo.maxReward.toLocaleString()}
                        </span>
                      </div>

                      <div
                        className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${
                          isExpiringSoon
                            ? isSelected
                              ? 'text-yellow-300'
                              : 'text-[var(--color-danger)]'
                            : isSelected
                              ? 'text-[var(--color-text-on-gold)]/70'
                              : 'text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>
                          {isExpiringSoon && '⚠️ '}
                          {formatDistanceToNow(new Date(booster.expiresAt), { addSuffix: true })}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="absolute right-2 top-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg-surface)] text-xs text-[var(--color-text-primary)] shadow-sm">
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

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
        <SpinHistory spins={spinHistoryData?.spins || []} isLoading={isLoadingHistory} />
      </div>
    </div>
  )
}
