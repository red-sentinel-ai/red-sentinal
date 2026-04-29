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
            the first crowdsource AI red teaming platform. Cryptographic verification. Instant
            settlement. No middlemen.
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
            <h3 className="text-xl md:text-2xl font-medium mb-4">Cryptographic Proof</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              Every attack is verified inside a Trusted Execution Environment (TEE) with
              cryptographic attestations. No fake exploits. No disputed payouts. Pure, verifiable
              truth on-chain.
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
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x border-t border-black lg:border-t-0 lg:border-x-0 lg:border-l min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Instant Settlement</h3>

            <p className="mt-auto text-sm md:text-base text-[#939393]">
              No waiting for bug bounty committees. No paperwork. Successful attacks pay out
              instantly via Sui&apos;s parallel execution. Your reward hits your wallet the moment
              verification completes.
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
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 bg-[#F5F5F5] flex flex-col border-x  border-t border-black lg:border-t-0 lg:border-x-0 lg:border-l lg:border-r min-h-[350px]"
          >
            <h3 className="text-xl md:text-2xl font-medium mb-4">Scalable Marketplace</h3>

            <div className="mt-auto text-sm md:text-base text-[#939393]">
              Web2 competitors charge for red teaming as a service. We built it as a marketplace
              that scales without us doing the work. More Sentinels = more attackers = more security
              data = stronger AI for everyone.
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
