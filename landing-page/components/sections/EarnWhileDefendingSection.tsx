'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_URL } from '@/constants'
import Image from 'next/image'

export function EarnWhileDefendingSection() {
  return (
    <section
      id="earn"
      className="relative flex justify-center py-24 overflow-visible px-4 md:px-10"
    >
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[830px] z-0 opacity-30"
      >
        <source
          src="/videos/threeCircles.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video> */}
      <Image
        src="/img/bottom_ring.webp"
        alt="animation section art"
        width={1066.5}
        height={1005}
        className="absolute -top-40 md:-top-60 pointer-events-none select-none opacity-48 w-[400px] md:w-[700px] lg:w-auto left-1/2 -translate-x-1/2"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-snug text-black">
          Skill-Based Income for AI Red Teamers. Turn your{' '}
          <span className="text-[#C871FF]">
            prompt engineering expertise into real token rewards.{' '}
          </span>
          Every successful attack pays instantly. No delays, no disputes, pure meritocracy.
        </h2>
        <p className="mt-6 text-lg md:text-xl text-[#5F5C5C] max-w-4xl">
          Unlike bug bounties that take weeks to process, Red Sentinel settles rewards on-chain the
          moment your exploit is verified. Your skills, your profits, your schedule.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href={SUI_SENTINEL_APP_URL} target="_blank">
            <button className="btn btn-black md:w-[260px] px-6">Start Earning Now</button>
          </Link>

          <Link href={SUI_SENTINEL_X_URL} target="_blank">
            <button className="btn btn-outline px-6 font-medium">Follow on X</button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
