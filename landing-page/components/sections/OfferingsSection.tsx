'use client'

import { motion } from 'framer-motion'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function OfferingsSection() {
  return (
    <section id="offerings" className="py-24 relative text-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <div className="relative z-10 max-w-7xl mx-auto md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16 px-4 md:px-10"
        >
          <div className="badge-pink w-fit mb-6">• Offerings</div>
          <h2 className="text-2xl md:text-[48px] font-medium leading-tight">
            Two Ways to Participate in the{' '}
            <span className="text-[#C871FF]">AI Security Economy</span>
          </h2>
          <p className="text-lg md:text-xl text-[#5F5C5C] mt-4 max-w-3xl">
            Whether you&apos;re stress-testing AI systems for profit or deploying hardened agents
            for your users. Every interaction makes AI safer for everyone.
          </p>
          <Link 
            href="/red-teaming" 
            className="inline-flex items-center gap-2 mt-4 text-[#C871FF] hover:text-[#F632F3] transition-colors group"
          >
            <span className="font-medium">Learn about AI Red Teaming</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 md:px-10"
        >
          <div className="relative p-3 md:p-8 flex flex-col justify-between min-h-[300px] border border-black md:border-r-0">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Attack & Earn</h3>

              <p className="text-base md:text-[20px] leading-relaxed text-[#939393]">
                Browse active Sentinels, pay per attack, and use your prompt engineering skills to
                break AI defenses. Every successful exploit pays instantly in real tokens. The ultimate
                test of your red teaming skills.
              </p>

              <div className="min-h-[220px] sm:min-h-[260px] md:min-h-[300px]">
                <Image
                  src="/img/customAIArt.png"
                  alt="custom ai"
                  width={500}
                  height={500}
                  className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] h-auto mx-auto absolute top-[20%] sm:top-[8%] md:top-[12%] left-1/2 -translate-x-1/2"
                />
              </div>
            </div>
            <Link href={SUI_SENTINEL_APP_URL} target="_blank" className="mt-1">
              <button className="btn btn-outline px-8 mt-12 md:mt-0">Start Attacking</button>
            </Link>
          </div>

          <div className="relative p-3 md:p-8 border border-black border-t-0 md:border-t md:border-t-black md:border-l flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Deploy & Defend</h3>
              <p className="text-base md:text-[20px] leading-relaxed text-[#939393]">
                Launch your AI as a Sentinel with a staked prize pool. The world tries to break it.
                You earn from every attack attempt while gathering invaluable adversarial data to
                harden your defenses.
              </p>

              <div className="min-h-0 sm:min-h-[200px] md:min-h-[300px]">
                <Image
                  src="/img/deploySentinelArt.png"
                  alt="deploy sentinel"
                  width={400}
                  height={400}
                  className="relative w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[400px] h-auto mx-auto my-6 md:absolute md:bottom-[2%] md:my-0"
                />
              </div>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank" className="mt-1">
                <button className="btn btn-outline px-7">Deploy Sentinel</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
