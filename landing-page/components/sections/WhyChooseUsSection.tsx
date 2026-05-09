'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 md:py-24 relative text-black mt-40">
      <div className="vertical-line left-4 -top-40"></div>
      <div className="vertical-line right-4 -top-40"></div>
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
            Why Red Sentinel?
          </h2>
          <p className="text-base md:text-2xl mx-auto max-w-[320px] md:max-w-3xl">
            Talk is cheap. Your on-chain record isn&apos;t.{' '}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 border-y border-black">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x border-t border-black lg:border-t-0 lg:border-x-0 lg:border-l min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Real Stakes</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              This isn&apos;t a sandbox. Real money on the line. Real payouts when you win. The
              stakes make you take it seriously,and that&apos;s how skills develop.
            </p>

            <div className="flex items-center justify-center h-full">
              <Image
                width={367}
                height={243}
                src="/img/incentivizedIntelligence.png"
                alt="evolving security art"
                className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[367px] h-auto"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x border-black lg:border-x-0 lg:border-l min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Verified Results</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              Every attack judged inside a Trusted Execution Environment. No disputes. No
              committees. If you broke through, you win. Instantly.
            </p>
            <div className="flex items-center justify-center h-full">
              <Image
                width={400}
                height={400}
                src="/img/evolvingSecurityArt.png"
                alt="evolving security art"
                className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] h-auto"
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
            <h3 className="text-xl md:text-2xl font-medium mb-4">Portable Proof</h3>

            <div className="mt-auto text-sm md:text-base text-[#939393]">
              Your attack history is on-chain. Verifiable. Permanent. Not claims on a resume, proof
              of what you&apos;ve actually done.
            </div>

            <div className="flex items-center justify-center h-full">
              <Image
                width={220}
                height={400}
                src="/img/dualPower.png"
                alt="evolving security art"
                className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
