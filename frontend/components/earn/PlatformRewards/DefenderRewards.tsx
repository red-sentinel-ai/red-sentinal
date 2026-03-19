'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { DEFENDER_DIRECT_REWARDS, DEFENDER_FUNDING_BOOSTERS } from '@/lib/earn-utils'

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
              <p className="text-sm text-gray-600">Deploy sentinels and earn booster coupons</p>
            </div>
          </div>

          {/* Deploy Reward */}
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

          {/* Funding Booster Tiers */}
          <div className="mb-6">
            <h4 className="mb-1 font-semibold text-black">Fund Your Sentinel And Get Booster Coupons</h4>
            <p className="mb-3 text-xs text-gray-500">
              Every time you add funds to your sentinel, you receive a booster coupon. Spin it to claim your Sentinel tokens.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-4 text-left font-medium text-gray-700">Amount Funded</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-700">Booster Coupon</th>
                    <th className="pb-2 text-left font-medium text-gray-700">SENTINEL Range</th>
                  </tr>
                </thead>
                <tbody>
                  {DEFENDER_FUNDING_BOOSTERS.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4 text-black">{item.minSui}</td>
                      <td className="py-2 pr-4 font-medium text-black">{item.booster}</td>
                      <td className="py-2 text-gray-700">{item.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/defend" className="flex-1">
              <button className="btn btn-black flex w-full items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Deploy a Sentinel
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
