'use client'

import { motion } from 'framer-motion'
import { ThreeStepFlow } from './ThreeStepFlow'
import { BoosterTierRow } from './BoosterTierRow'
import { ExpandableInfo } from './ExpandableInfo'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[var(--color-bg-subtle)] py-10 md:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h2 className="page-heading mb-2">How It Works</h2>
          <p className="page-subheading mx-auto text-center">
            Three simple steps from earning boosters to collecting SENTINEL tokens
          </p>
        </motion.div>

        {/* Three Step Flow */}
        <div className="mb-8">
          <ThreeStepFlow />
        </div>

        {/* Booster Tier Reference */}
        <div className="mb-8">
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
