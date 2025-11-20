'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import Image from 'next/image'

export function EarnWhileDefendingSection() {
  return (
    <section id="earn" className="relative flex justify-center py-24 overflow-visible">
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
        src="/img/bottom_ring.png"
        alt="animation section art"
        width={1066.5}
        height={1005}
        className="
          absolute
          -top-20
          pointer-events-none
          select-none
          opacity-48
      
        "
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <h2 className="text-[48px] md:text-5xl font-medium leading-snug text-black">
          Earn While Defending Sentinels. Turn your{' '}
          <span className="text-[#C871FF]">Prompt engineering skills into SUI/USDC rewards. </span>
          Every successful defense strengthens AI and your wallet.
        </h2>
        <div className="mt-10">
          <Link href={SUI_SENTINEL_APP_URL} target="_blank">
            <button className="btn btn-black md:w-[260px] px-6">Start Earning Now</button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
