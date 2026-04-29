'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <div className="py-24 relative text-black bg-[#F7F9FF] z-10">
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16 flex flex-col items-center"
          >
            <div className="badge-pink mb-8"> • how it works </div>
            <h2 className="text-3xl md:text-[48px] font-medium mb-4">
              The <span className="text-[#C871FF]">Trustless</span> Red Teaming Flywheel
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-[20px]">
              Attackers pay per message. That fee funds bigger bounties, rewards defenders, and
              sustains the protocol. Every failed attack grows the prize pool, attracting more
              attackers, generating more security data, making defenders stronger. A
              self-reinforcing system that gets more valuable with scale.
            </p>
          </motion.div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Image
                src="/img/howItWorksLG.png"
                alt="How Red Sentinel Works: Deploy, Attack & Earn, Evolve & Profit (Desktop)"
                width={1120}
                height={600}
                className="hidden lg:block w-full h-auto object-contain"
                quality={100}
              />
              <Image
                src="/img/howItWorksSM.png"
                alt="How Red Sentinel Works: Deploy, Attack & Earn, Evolve & Profit (Mobile)"
                width={500}
                height={800}
                className="block lg:hidden w-full h-auto max-w-md mx-auto object-contain"
                quality={100}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[-5%] sm:bottom-[-9%] md:bottom-[-15%] lg:bottom-[-22%] left-1/2 -translate-x-1/2">
        <Image
          src="/img/fullCircle.png"
          width={535}
          height={802}
          alt="full circle"
          quality={100}
          className="w-[200px] sm:w-[300px] md:w-[400px] lg:w-[535px] h-auto"
        />
      </div>
    </section>
  )
}
