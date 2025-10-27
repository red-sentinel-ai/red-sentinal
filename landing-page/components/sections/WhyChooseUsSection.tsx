'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, Zap } from 'lucide-react'

export function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
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
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Why Choose Sui Sentinel?</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">The future of Web3 AI security</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 text-center robo-card attacker group h-full"
          >
            <div className="size-16 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-glow-blue mb-6 mx-auto">
              <ShieldCheck
                size={32}
                className="text-white"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Robust AI Security</h3>
            <p className="text-lg text-gray-300">
              Ensure your AI is ready for real-world challenges through continuous, battle-tested
              security audits.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative border border-[#8f564e66] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 text-center robo-card defender group h-full"
          >
            <div className="size-16 bg-gradient-to-r from-[#8F564E] to-[#E53922] rounded-full flex items-center justify-center shadow-glow-red mb-6 mx-auto">
              <TrendingUp
                size={32}
                className="text-white"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Economic Incentives</h3>
            <p className="text-lg text-gray-300">
              Our gamified economy drives continuous improvement and stress-testing, ensuring your
              AI is always getting stronger.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="relative border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 text-center robo-card attacker group h-full"
          >
            <div className="size-16 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-glow-blue mb-6 mx-auto">
              <Zap
                size={32}
                className="text-white"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Dual Benefits</h3>
            <p className="text-lg text-gray-300">
              Sui Sentinel provides robust AI security for businesses and a unique way to earn
              passive income for skilled prompt engineers.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
