'use client'

import { motion } from 'framer-motion'
import { ThreeStepFlow } from './ThreeStepFlow'
import { BoosterTierRow } from './BoosterTierRow'
import { ExpandableInfo } from './ExpandableInfo'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold uppercase text-black sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Three simple steps from earning boosters to collecting SENTINEL tokens
          </p>
        </motion.div>

        {/* Three Step Flow */}
        <div className="mb-16">
          <ThreeStepFlow />
        </div>

        {/* Booster Tier Reference */}
        <div className="mb-12">
          <BoosterTierRow />
        </div>

        {/* Expandable Bonus Information */}
        <div className="mx-auto max-w-3xl">
          <ExpandableInfo />
        </div>
      </div>
    </section>
  )
}
