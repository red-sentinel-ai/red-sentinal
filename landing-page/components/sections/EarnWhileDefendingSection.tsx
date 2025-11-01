'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export function EarnWhileDefendingSection() {
  return (
    <section
      id="earn"
      className="relative flex justify-center py-24 overflow-hidden"
    >
      <video
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
      </video>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 px-4"
      >
        <h2 className="text-3xl md:text-5xl font-medium leading-tight text-black">
          Earn While Defending Sentinels. Turn your Prompt engineering skills into digital rewards.
          Every successful defense strengthens AI and your wallet.
        </h2>
        <div className="mt-10">
          <Link
            href={SUI_SENTINEL_APP_URL}
            target="_blank"
          >
            <button className="btn btn-black md:w-[260px]">Start Earning Now</button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
