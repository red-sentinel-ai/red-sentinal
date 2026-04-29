'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function VisionSection() {
  return (
    <section
      id="vision"
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
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span>Our Mission</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto">
            Ensuring the future of on-chain AI is robust, secure, and trustworthy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="border border-[#383838] backdrop-blur-sm p-8 lg:p-12 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 border border-black rounded-full px-6 py-3 mb-6">
                <div className="size-8 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center">
                  <div>
                    <Image
                      src="/icons/local_police.png"
                      width={24}
                      height={24}
                      alt="local police icon"
                    />
                  </div>
                </div>
                <h3 className="font-bold ">The Future of AI Security</h3>
              </div>
            </div>

            <p className="text-lg md:text-xl leading-relaxed mb-8">
              Red Sentinel is built on this fundamental truth. We provide the first-ever platform
              for <span className="font-semibold">&quot;Prompt-First Security.&quot;</span> This
              isn&apos;t just a game; it&apos;s the necessary evolution of smart contract audits for
              the AI era. We battle-test the models that will soon underpin the decentralized world.
            </p>
            <p className="text-lg md:text-xl leading-relaxed mb-8">
              Our mission is to empower the pioneers of this new world: the{' '}
              <span className="font-semibold">prompt engineers</span>, the{' '}
              <span className="font-semibold">AI whisperers</span>, the{' '}
              <span className="font-semibold">digital architects</span>
              and to ensure the future of on-chain AI is robust, secure, and trustworthy.
            </p>

            <div className="flex max-w-[400px] mx-auto mb-8">
              <div className="blue gradient-border"></div>
              <div className="blue gradient-border rotate-180"></div>
            </div>

            <p className="text-lg md:text-xl leading-relaxed">
              This is the future of smart contract audits for the AI era.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
