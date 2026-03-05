'use client'

import { Card, CardContent } from '@/components/ui'
import { REFERRAL_REWARDS, REFERRAL_TIER_PROGRESS } from '@/lib/earn-utils'

export function ReferralRewardTable() {
  return (
    <div className="space-y-6">
      {/* Reward Table */}
      <Card className="rounded-2xl border-gray-200 bg-white">
        <CardContent className="p-6 md:p-8">
          <h3 className="mb-4 text-xl font-bold text-black">Referral Rewards</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="pb-3 pr-4 text-left font-semibold text-gray-700">
                    Referral Action
                  </th>
                  <th className="pb-3 pr-4 text-left font-semibold text-gray-700">
                    Your Spin Pass
                  </th>
                  <th className="pb-3 text-left font-semibold text-gray-700">
                    New User Gets
                  </th>
                </tr>
              </thead>
              <tbody>
                {REFERRAL_REWARDS.map((reward, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 text-black">{reward.action}</td>
                    <td className="py-3 pr-4 font-medium text-black">{reward.userBooster}</td>
                    <td className="py-3 text-gray-700">{reward.newUserBooster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progression */}
      <Card className="rounded-2xl border-gray-200 bg-white">
        <CardContent className="p-6 md:p-8">
          <h3 className="mb-2 text-xl font-bold text-black">Tier Multiplier Progression</h3>
          <p className="mb-4 text-sm text-gray-600">
            Earn bonus multipliers on all referral Spin Passes based on total referrals
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REFERRAL_TIER_PROGRESS.map((tier, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="mb-1 text-2xl font-bold text-black">{tier.minReferrals}+</p>
                <p className="text-xs text-gray-500">referrals</p>
                <p className="mt-2 text-sm font-semibold text-blue-600">{tier.bonus}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-700">
              Example: With 50+ referrals, a 10x Epic Spin Pass becomes a 15x Spin Pass (10x × 1.5
              = 15x)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
