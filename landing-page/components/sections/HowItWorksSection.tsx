'use client'

import { motion } from 'framer-motion'
import { Shield, Trophy, Zap } from 'lucide-react'

const steps = [
  {
    icon: Shield,
    title: 'Deploy a Sentinel',
    description: 'Users deploy a protective AI entity backed by funds and custom instructions.',
  },
  {
    icon: Zap,
    title: 'Attack and Earn',
    description:
      'Attackers attempt to breach the Sentinel’s defenses to steal its funds. Every attack costs a fee, which is split to incentivize testing.',
  },
  {
    icon: Trophy,
    title: 'Rewards & Growth',
    description:
      'A part of the attack fee boosts the prize pool, another part rewards the Sentinel’s creator, and 10% supports platform maintenance. This gamified economy drives relentless stress-testing, making AI models stronger.',
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
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
              How Sui Sentinel Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A gamified economy for AI security
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="border border-[#558eb466] bg-[#12121266] rounded-lg lg:rounded-2xl px-4 py-8 lg:p-6 text-center robo-card attacker group"
            >
              <div className="flex flex-col items-center gap-4 py-4 px-2">
                <div className="size-16 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center shadow-glow-blue mb-4">
                  <step.icon
                    size={32}
                    className="text-white"
                  />
                </div>
                <h4 className="font-semibold text-white mb-2 text-xl">{step.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
