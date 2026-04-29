'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

export function PassiveIncomeSection() {
  return (
    <section
      id="passive-income"
      className="py-24 relative"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6">
            Passive Income for Prompt Engineers
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Monetize your expertise</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative p-8 border border-black group h-full overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full items-center text-center">
            <div className="size-16 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-glow-blue mb-6">
              <Trophy
                size={32}
                className="text-white"
              />
            </div>

            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-3xl">
              Red Sentinel isn’t just for companies. Individuals with strong prompt-crafting skills
              can create Sentinels, stake funds, and earn passive income from attack fees. It’s a
              unique way to monetize your expertise while contributing to AI security.
            </p>

            <div className="flex max-w-[280px] sm:max-w-[350px] md:max-w-[400px] mx-auto mb-8">
              <div className="blue gradient-border"></div>
              <div className="blue gradient-border rotate-180"></div>
            </div>

            <p className="text-lg md:text-xl leading-relaxed max-w-3xl">
              This is the future of smart contract audits for the AI era.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
