'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 md:py-24 relative text-black mt-40">
      <div className="relative z-10 max-w-7xl mx-auto lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 flex flex-col items-center"
        >
          <div className="badge-pink min-w-40 mb-6">• why us</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 max-w-[282px] md:max-w-none">
            Built by Guardians, for Guardians
          </h2>
          <p className="text-base md:text-2xl mx-auto max-w-[270px] md:max-w-none">
            From businesses to engineers every Guardian strengthens the network.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 border-y border-black">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x border-black lg:border-x-0 lg:border-l min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Evolving Security</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              Every attack strengthens the network. Every defense makes AI smarter. Sui Sentinel
              turns testing into evolution creating intelligence that learns from every battle.
            </p>
            <div className="flex items-center justify-center h-full">
              <Image
                width={400}
                height={400}
                src="/img/evolvingSecurityArt.png"
                alt="evolving security art"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x border-t border-black lg:border-t-0 lg:border-x-0 lg:border-l min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Incentivized Intelligence</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              Earn for every move that matters. Guardians don&apos;t just protect they profit from
              progress. Our gamified rewards ensure constant testing and growth.
            </p>

            <div className="flex items-center justify-center h-full">
              <Image
                width={367}
                height={243}
                src="/img/incentivizedIntelligence.png"
                alt="evolving security art"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x  border-t border-black lg:border-t-0 lg:border-x-0 lg:border-l lg:border-r min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Dual Power</h3>

            <div className="mt-auto text-sm md:text-base text-[#939393]">
              <ul className="list-disc list-inside space-y-2">
                <li>For builders — unmatched AI resilience.</li>
                <li>For prompt engineers — endless earning through skill and precision.</li>
                <li>Together, we secure the future of intelligent systems.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center h-full">
              <Image
                width={220}
                height={400}
                src="/img/dualPower.png"
                alt="evolving security art"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
