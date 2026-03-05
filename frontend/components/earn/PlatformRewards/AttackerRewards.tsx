'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Swords, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { ATTACKER_REWARDS } from '@/lib/earn-utils'

export function AttackerRewards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full rounded-2xl border-gray-200 bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Swords className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">Attacker Rewards</h3>
              <p className="text-sm text-gray-600">Auto-earn Spin Passes from on-chain activity</p>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-3 pr-4 text-left font-semibold text-gray-700">Action</th>
                  <th className="pb-3 pr-4 text-left font-semibold text-gray-700">Spin Pass</th>
                  <th className="pb-3 text-left font-semibold text-gray-700">SENTINEL Range</th>
                </tr>
              </thead>
              <tbody>
                {ATTACKER_REWARDS.map((reward, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-black">{reward.action}</td>
                    <td className="py-3 pr-4 font-medium text-black">{reward.booster}</td>
                    <td className="py-3 text-gray-700">{reward.sentinelRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link href="/attack">
            <button className="btn btn-black flex w-full items-center justify-center gap-2 md:w-auto">
              <Swords className="h-4 w-4" />
              Start Attacking
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
