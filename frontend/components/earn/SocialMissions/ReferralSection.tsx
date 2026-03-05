'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { ReferralLinkGenerator } from './ReferralLinkGenerator'
import { ReferralRewardTable } from './ReferralRewardTable'

export function ReferralSection() {
  const account = useCurrentAccount()

  // Mock data - will be replaced with real API
  const mockData = {
    referredCount: 0,
    convertedCount: 0,
    totalEarned: 0,
  }

  return (
    <div className="space-y-6">
      {/* Link Generator & Stats */}
      <ReferralLinkGenerator
        walletAddress={account?.address || null}
        referredCount={mockData.referredCount}
        convertedCount={mockData.convertedCount}
        totalEarned={mockData.totalEarned}
      />

      {/* Reward Tables */}
      <ReferralRewardTable />
    </div>
  )
}
