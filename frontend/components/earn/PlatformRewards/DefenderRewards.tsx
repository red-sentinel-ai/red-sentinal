'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ArrowRight, Calculator } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import {
  DEFENDER_DIRECT_REWARDS,
  DURATION_MULTIPLIERS,
  DEFENSE_MULTIPLIERS,
  MILESTONE_BOOSTERS,
} from '@/lib/earn-utils'

const REWARD_CALCULATOR_URL = 'https://www.suisentinel.xyz/reward-calculator'

export function DefenderRewards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="h-full rounded-2xl border-gray-200 bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">Defender Rewards</h3>
              <p className="text-sm text-gray-600">Stake SUI and earn passive income</p>
            </div>
          </div>

          {/* Direct Rewards */}
          <div className="mb-6">
            <h4 className="mb-3 font-semibold text-black">Direct Rewards</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-4 text-left font-medium text-gray-700">Action</th>
                    <th className="pb-2 text-left font-medium text-gray-700">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {DEFENDER_DIRECT_REWARDS.map((reward, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-black">{reward.action}</td>
                      <td className="py-2 font-medium text-black">{reward.reward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staking Formula */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-black">Daily Staking Formula</h4>
            <div className="overflow-x-auto">
              <code className="block whitespace-nowrap text-xs text-black md:text-sm">
                Daily SENTINEL = (Pool Size × 50) × Duration Multiplier × Defense Multiplier
              </code>
            </div>
          </div>

          {/* Duration Multipliers */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-black">Duration Multipliers</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {DURATION_MULTIPLIERS.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.duration}:</span>
                  <span className="font-semibold text-black">{item.multiplier}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Defense Multipliers */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-black">Defense Multipliers</h4>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
              {DEFENSE_MULTIPLIERS.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">{item.condition}:</span>
                  <span className="font-semibold text-black">{item.multiplier}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Spin Passes */}
          <div className="mb-6">
            <h4 className="mb-3 font-semibold text-black">Milestone Spin Passes</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-4 text-left font-medium text-gray-700">Milestone</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-700">Spin Pass</th>
                    <th className="pb-2 text-left font-medium text-gray-700">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {MILESTONE_BOOSTERS.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-black">{item.milestone}</td>
                      <td className="py-2 pr-4 font-medium text-black">{item.booster}</td>
                      <td className="py-2 text-gray-700">{item.sentinelRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/defend" className="flex-1">
              <button className="btn btn-black flex w-full items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Deploy a Sentinel
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <a
              href={REWARD_CALCULATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <button className="btn btn-outline flex w-full items-center justify-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculate Rewards
              </button>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
