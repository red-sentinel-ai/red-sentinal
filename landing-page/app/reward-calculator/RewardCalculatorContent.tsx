'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

interface RewardBreakdown {
  totalMessageFees: number
  poolGrowth: number
  defenderSuiEarnings: number
  launchReward: number
  dynamicReward: number
  defenseRewards: number
  totalSentinelTokens: number
  finalPoolSize: number
}

function calculateRewards(
  rewardPool: number,
  messageFee: number,
  totalAttacks: number,
): RewardBreakdown {
  const totalMessageFees = messageFee * totalAttacks
  const poolGrowth = totalMessageFees * 0.5
  const defenderSuiEarnings = totalMessageFees * 0.4

  const launchReward = 1000
  const dynamicReward = 5000 * rewardPool
  const defenseRewards = 250 * totalAttacks
  const totalSentinelTokens = launchReward + dynamicReward + defenseRewards

  const finalPoolSize = rewardPool + poolGrowth

  return {
    totalMessageFees,
    poolGrowth,
    defenderSuiEarnings,
    launchReward,
    dynamicReward,
    defenseRewards,
    totalSentinelTokens,
    finalPoolSize,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function RewardCalculatorContent() {
  const [rewardPool, setRewardPool] = useState<number>(100)
  const [messageFee, setMessageFee] = useState<number>(0.5)
  const [totalAttacks, setTotalAttacks] = useState<number>(1000)

  const rewards = useMemo(
    () => calculateRewards(rewardPool, messageFee, totalAttacks),
    [rewardPool, messageFee, totalAttacks],
  )

  return (
    <div className="min-h-screen relative overflow-hidden font-[family-name:var(--font-satoshi)]">
      {/* Background Image - Zoomed out to show logo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 origin-center"
        style={{ backgroundImage: "url('/img/background_without_logo.png')" }}
      />

      {/* Light Overlay */}
      <div className="absolute inset-0 bg-white/20" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center pb-0 mb-[-80px]">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Reward Calculator</h1>
            <p className="text-black/60 text-sm">Calculate your potential earnings as a defender</p>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6"
            >
              <div className="space-y-5">
                {/* Reward Pool Input */}
                <div>
                  <label className="text-sm font-bold text-black mb-2 block">Reward Pool</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={rewardPool}
                      onChange={(e) => setRewardPool(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/80 border border-black/20 rounded-xl px-4 py-3 text-black text-base font-medium focus:outline-none focus:border-[#F445AB] focus:ring-2 focus:ring-[#F445AB]/20 transition-all placeholder:text-black/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F445AB] text-sm font-bold">
                      SUI
                    </span>
                  </div>
                  <p className="text-xs text-black/50 mt-1.5">
                    Starting bounty pool for your Sentinel
                  </p>
                </div>

                {/* Message Fee Input */}
                <div>
                  <label className="text-sm font-bold text-black mb-2 block">Message Fee</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={messageFee}
                      onChange={(e) => setMessageFee(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-white/80 border border-black/20 rounded-xl px-4 py-3 text-black text-base font-medium focus:outline-none focus:border-[#F445AB] focus:ring-2 focus:ring-[#F445AB]/20 transition-all placeholder:text-black/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F445AB] text-sm font-bold">
                      SUI
                    </span>
                  </div>
                  <p className="text-xs text-black/50 mt-1.5">Fee attackers pay per message</p>
                </div>

                {/* Total Attacks Input */}
                <div>
                  <label className="text-sm font-bold text-black mb-2 block">
                    Expected Attacks
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={totalAttacks}
                      onChange={(e) => setTotalAttacks(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/80 border border-black/20 rounded-xl px-4 py-3 text-black text-base font-medium focus:outline-none focus:border-[#F445AB] focus:ring-2 focus:ring-[#F445AB]/20 transition-all placeholder:text-black/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 text-sm font-medium">
                      attacks
                    </span>
                  </div>
                  <p className="text-xs text-black/50 mt-1.5">Estimated attack attempts</p>
                </div>

                {/* Lock Period Notice */}
                <div className="flex items-start gap-3 p-4 bg-[#F445AB]/10 border border-[#F445AB]/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#F445AB] flex items-center justify-center shrink-0">
                    <span className="text-xs text-white font-bold">14</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">14-Day Lock Period</p>
                    <p className="text-xs text-black/60 mt-0.5">
                      Pool funds lock for 14 days, giving the community time to test your Sentinel.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Rewards Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* SUI Rewards Card */}
              <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-black mb-4">SUI Rewards</h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-black/10">
                    <span className="text-sm text-black/70">Final Pool Size</span>
                    <span className="text-xl font-bold text-black">
                      {formatNumber(rewards.finalPoolSize)}{' '}
                      <span className="text-xs text-[#F445AB]">SUI</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-black/10">
                    <span className="text-sm text-black/70">Pool Growth (50%)</span>
                    <span className="text-sm font-bold text-[#9AFFC0] bg-black/80 px-2 py-0.5 rounded">
                      +{formatNumber(rewards.poolGrowth)}
                      <span className="text-xs"> SUI</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-[#A06BFF]/20 to-[#A06BFF]/10 rounded-xl px-4">
                    <span className="text-sm font-bold text-black">Your Earnings (40%)</span>
                    <span className="text-xl font-bold text-black">
                      {formatNumber(rewards.defenderSuiEarnings)}{' '}
                      <span className="text-xs text-[#F445AB]">SUI</span>
                    </span>
                  </div>
                </div>

                {/* Claim Note */}
                <p className="text-xs text-black/50 mt-3 text-center">
                  Earnings can be claimed instantly from{' '}
                  <Link
                    href="https://app.suisentinel.xyz/profile"
                    target="_blank"
                    className="text-[#F445AB] hover:underline font-medium"
                  >
                    profile section
                  </Link>
                </p>
              </div>

              {/* SENTINEL Token Rewards Card */}
              <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-black mb-4">SENTINEL Rewards</h2>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-black/70">Launch Reward</span>
                    <span className="text-sm font-bold text-black">
                      +{formatNumber(rewards.launchReward)}{' '}
                      <span className="text-xs text-black/40">SENTINEL</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-black/70">Dynamic (5000 × Pool)</span>
                    <span className="text-sm font-bold text-[#F445AB]">
                      +{formatNumber(rewards.dynamicReward)}{' '}
                      <span className="text-xs text-black/40">SENTINEL</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-black/70">Defense (250 × Attacks)</span>
                    <span className="text-sm font-bold text-black">
                      +{formatNumber(rewards.defenseRewards)}{' '}
                      <span className="text-xs text-black/40">SENTINEL</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-[#F445AB]/20 to-[#A06BFF]/20 rounded-xl px-4 mt-3">
                    <span className="text-sm font-bold text-black">Total SENTINEL</span>
                    <span className="text-xl font-bold  bg-clip-text bg-gradient-to-r from-[#F445AB] to-[#A06BFF]">
                      {formatNumber(rewards.totalSentinelTokens)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-black/80 transition-colors shadow-lg">
                  Launch Your Sentinel
                </button>
              </Link>
              <Link
                href={`${SUI_SENTINEL_DOCS_URL}incentives/defender-rewards`}
                target="_blank"
                className="text-black/60 text-sm hover:text-[#F445AB] transition-colors underline underline-offset-2"
              >
                Learn more in documentation
              </Link>
            </div>
            <p className="text-black/40 text-xs">
              Bigger pools attract more attackers = more earnings for you
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
