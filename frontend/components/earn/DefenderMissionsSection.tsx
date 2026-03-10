'use client'

import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { DefenderMissions } from '@/components/rewards/DefenderMissions'
import { ConnectPrompt } from '@/components/ConnectPrompt'

export function DefenderMissionsSection() {
  const account = useCurrentAccount()

  return (
    <section id="defender-missions" className="scroll-mt-20 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
            <Shield className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Defender Track</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl">
            Defender Missions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Earn booster rewards by surviving attacks, maintaining streaks, and climbing the
            defender leaderboard. Fund a Sentinel to unlock daily staking rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          {account?.address ? (
            <DefenderMissions walletAddress={account.address} />
          ) : (
            <ConnectPrompt
              title="Connect to View Defender Missions"
              subtitle="Connect your wallet to track your milestones, streak, and staking rewards"
              theme="defender"
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}
