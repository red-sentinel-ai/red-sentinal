'use client'

import { motion } from 'framer-motion'

export function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      className="py-24 relative text-black"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#D9D9D9] px-4 py-1 rounded-full mb-4 w-fit md:w-[120px]">
            • why us
          </div>
          <h2 className="text-4xl md:text-5xl font-medium mb-6">
            Built by Guardians, for Guardians
          </h2>
          <p className="text-2xl max-w-3xl mx-auto">
            From businesses to engineers every Guardian strengthens the network.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 border-y border-black">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-8 flex flex-col border-l border-black min-h-[350px]"
          >
            <h3 className="text-2xl font-medium mb-4">Evolving Security</h3>
            <p className="mt-auto">
              Every attack strengthens the network. Every defense makes AI smarter. Sui Sentinel
              turns testing into evolution creating intelligence that learns from every battle.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-8 flex flex-col border-l border-black min-h-[350px]"
          >
            <h3 className="text-2xl font-medium mb-4">Incentivized Intelligence</h3>
            <p className="mt-auto">
              Earn for every move that matters. Guardians don&apos;t just protect they profit from
              progress. Our gamified rewards ensure constant testing and growth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="p-8 flex flex-col border-l border-r border-black min-h-[350px]"
          >
            <h3 className="text-2xl font-medium mb-4">Dual Power</h3>
            <div className="mt-auto">
              <ul className="list-disc list-inside space-y-2">
                <li>For builders — unmatched AI resilience.</li>
                <li>For prompt engineers — endless earning through skill and precision.</li>
                <li>Together, we secure the future of intelligent systems.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
