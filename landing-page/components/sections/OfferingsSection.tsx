'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Brain, Code } from 'lucide-react'

export function OfferingsSection() {
  return (
    <section
      id="offerings"
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
              Our Two Powerful Offerings
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the right path for your AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-8 robo-card attacker group h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#558EB4]/5 to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="size-14 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-2xl flex items-center justify-center shadow-glow-blue">
                    <Brain className="size-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Custom-Trained AI Model</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#558EB4]/50 to-transparent" />
                </div>

                <p className="text-lg text-gray-300 leading-relaxed flex-1">
                  Forget relying on third-party APIs like OpenAI or Anthropic. Sui Sentinel offers a
                  proprietary, battle-tested AI model, continuously refined through our platform’s
                  stress-testing ecosystem. Companies integrating AI into their Web3 projects can
                  leverage our model, saving time and resources without building their own.
                </p>
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
                    <Code className="size-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Test Your Own Model</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#8F564E]/50 to-transparent" />
                </div>

                <p className="text-lg text-gray-300 leading-relaxed flex-1">
                  Already have an AI model? Deploy a Sentinel using your model’s endpoint and API
                  key. Our community of attackers, motivated by economic incentives, will rigorously
                  test its defenses. If they break through, it’s a clear signal to strengthen your
                  model—or consider switching to our custom-trained solution.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
