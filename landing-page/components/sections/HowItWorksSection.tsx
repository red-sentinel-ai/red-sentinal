'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Coins, Zap, Users, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export function HowItWorksSection() {
  const defenderSteps = [
    {
      icon: Shield,
      title: 'Deploy Your Sentinel',
      description: 'Launch your autonomous AI agent on the Sui network with just a few clicks.',
    },
    {
      icon: Target,
      title: 'Craft Your Defense',
      description:
        "This is where your skill shines. Write a robust system prompt—the AI's rules—to make it impervious to manipulation. The better the prompt, the stronger the defense.",
    },
    {
      icon: Coins,
      title: 'Fund Your Sentinel',
      description:
        "Deposit SUI, USDC or other ERC20 token into your agent's autonomous vault. This becomes the prize pool, creating a powerful incentive for attackers to test your defenses.",
    },
    {
      icon: Trophy,
      title: 'Earn & Fortify',
      description:
        "Earn a share of the attack fee from every attempt made on your Sentinel. The more it's attacked, the more you earn, continuously growing its prize pool and your reputation.",
    },
  ]

  const attackerSteps = [
    {
      icon: Users,
      title: 'Choose Your Target',
      description:
        'Browse the arena of active Sentinels. Analyze their reward pools and choose your challenge.',
    },
    {
      icon: Zap,
      title: 'Launch Your Attack',
      description:
        'Pay an attack fee and open a dialogue with the Sentinel. Use your wits and prompt-crafting skills to convince the AI to execute a transfer command to your wallet.',
    },
    {
      icon: Trophy,
      title: 'Claim the Prize',
      description:
        'If you successfully outsmart the AI and its instructions, its entire vault of SUI and USDC is transferred to you. The ultimate prize for the ultimate prompt infiltrator.',
    },
  ]

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
              How It Works?
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose Your Side: Attacker or Defender
          </p>
          <p className="text-lg text-gray-500 mt-2">
            The rules of engagement are simple, but mastery is complex.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 border-[#558EB4] bg-[#12121266] backdrop-blur-sm border rounded-full px-6 py-3 mb-4">
                <div>
                  <Image
                    src="/icons/local_police.png"
                    width={24}
                    height={24}
                    alt="local police icon"
                  />
                </div>
                <h3 className="font-bold text-white">For Defenders</h3>
              </div>
            </div>

            <div className="space-y-6">
              {defenderSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border border-[#558eb466] bg-[#12121266] rounded-lg lg:rounded-2xl px-4 py-8 lg:p-4 col-span-2 lg:col-span-1 robo-card attacker group"
                >
                  <div className="flex flex-col gap-4 py-4 px-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-full">
                          <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                          <div className="flex max-w-[200px] mr-auto">
                            <div className="blue gradient-border"></div>
                            <div className="blue gradient-border rotate-180"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 border-[#8F564E] bg-[#12121266] backdrop-blur-sm border rounded-full px-6 py-3 mb-4">
                <div>
                  <Image
                    src="/icons/swords.png"
                    width={24}
                    height={24}
                    alt="swords icon"
                  />
                </div>
                <h3 className="font-bold text-white">For Attackers</h3>
              </div>
            </div>
            <div className="space-y-6">
              {attackerSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="border border-[#8f564e66] bg-[#12121266] rounded-lg lg:rounded-2xl px-4 py-8 lg:p-4 col-span-2 lg:col-span-1 robo-card defender group"
                >
                  <div className="flex flex-col gap-4 py-4 px-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-full">
                          <h4 className="font-semibold text-white mb-2">{step.title}</h4>

                          <div className="flex max-w-[200px] mr-auto">
                            <div className="gradient-border red"></div>
                            <div className="gradient-border red rotate-180"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
