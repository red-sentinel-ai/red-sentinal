'use client'

import { motion } from 'framer-motion'
import { Quote, Brain, Code } from 'lucide-react'
import Image from 'next/image'

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
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Vision
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Why This Matters</p>
          <p className="text-lg text-gray-500 mt-2">
            The future of software is being rewritten in plain English.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl md:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] bg-clip-text text-transparent">
              The Paradigm Shift is Here:
            </span>
            <br />
            <span className="text-white">English is the New Code</span>
          </h3>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            We are at a pivotal moment in technological history. The very definition of software is
            changing.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="relative border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 robo-card attacker group h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#558EB4]/5 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-2xl flex items-center justify-center shadow-glow-blue">
                    <Quote className="size-7 text-white" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#558EB4]/50 to-transparent" />
                </div>

                <blockquote className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed flex-1">
                  &quot;Prompting is the new programming language.&quot;
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-[#558EB4]/20">
                  <div className="size-12 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center">
                    <Brain className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">Andrej Karpathy</p>
                    <p className="text-[#558EB4] font-medium">Former Director of AI at Tesla</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative border border-[#8f564e66] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 robo-card defender group h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8F564E]/5 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-gradient-to-r from-[#8F564E] to-[#E53922] rounded-2xl flex items-center justify-center shadow-glow-red">
                    <Quote className="size-7 text-white" />
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#8F564E]/50 to-transparent" />
                </div>

                <blockquote className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed flex-1">
                  &quot;AI is limited by prompters.&quot;
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-[#8F564E]/20">
                  <div className="size-12 bg-gradient-to-r from-[#8F564E] to-[#E53922] rounded-full flex items-center justify-center">
                    <Code className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">Balaji Srinivasan</p>
                    <p className="text-[#8F564E] font-medium">Former CTO of Coinbase</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="border border-[#383838] bg-[#12121266] backdrop-blur-sm rounded-lg lg:rounded-2xl p-8 lg:p-12 max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 border-[#558eb480] bg-[#12121266] backdrop-blur-sm border rounded-full px-6 py-3 mb-6">
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
                <h3 className="font-bold text-white">Our Mission</h3>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Sui Sentinel is built on this fundamental truth. We provide the first-ever platform
              for{' '}
              <span className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent font-semibold">
                &quot;Prompt-First Security.&quot;
              </span>{' '}
              This isn&apos;t just a game; it&apos;s the necessary evolution of smart contract
              audits for the AI era. We battle-test the models that will soon underpin the
              decentralized world.
            </p>

            <div className="flex max-w-[400px] mx-auto mb-8">
              <div className="blue gradient-border"></div>
              <div className="blue gradient-border rotate-180"></div>
            </div>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Our mission is to empower the pioneers of this new world—the{' '}
              <span className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent font-semibold">
                prompt engineers
              </span>
              , the{' '}
              <span className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent font-semibold">
                AI whisperers
              </span>
              , the{' '}
              <span className="bg-gradient-to-r from-[#558EB4] to-[#1388D5] bg-clip-text text-transparent font-semibold">
                digital architects
              </span>
              —and to ensure the future of on-chain AI is robust, secure, and trustworthy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
