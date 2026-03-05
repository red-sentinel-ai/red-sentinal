'use client'

import { motion } from 'framer-motion'
import { AttackerRewards } from './AttackerRewards'
import { DefenderRewards } from './DefenderRewards'

export function PlatformRewardsSection() {
  return (
    <section id="platform-rewards" className="scroll-mt-20 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl">
            Platform Rewards Reference
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Automatic rewards for participating in the Sui Sentinel ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AttackerRewards />
          <DefenderRewards />
        </div>
      </div>
    </section>
  )
}
