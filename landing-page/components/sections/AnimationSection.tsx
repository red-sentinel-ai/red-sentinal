'use client'

import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_TELEGRAM_URL } from '@/constants'
import Image from 'next/image'

export const AnimationSection = () => {
  return (
    <div className="relative px-4 md:px-10">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <div className="relative flex items-center max-w-[1340px] mx-auto pt-12 md:py-24 overflow-visible">
        <div className="relative z-10 w-full text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-snug font-medium">
            AI systems are attacked through language by anyone, not just expert hackers.
            <span className="text-[#C871FF]">
              Existing security tools weren&apos;t built for this.
            </span>
          </h2>
          <p className="max-w-[984px] text-base md:text-2xl mt-8 mx-auto md:mx-0 text-[#5F5C5C]">
            Red Sentinel is a crowdsourced AI red teaming marketplace. Companies deploy their AI as
            &quot;Sentinels&quot;, defenders stake capital, attackers pay to break them, and every
            successful exploit is verified cryptographically. Built on Sui for trustless, instant
            settlement.
          </p>
          <div className="flex flex-row gap-6 mt-10 justify-start">
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="btn btn-black px-6">Explore Platform</button>
            </Link>
            <Link href={SUI_SENTINEL_TELEGRAM_URL} target="_blank">
              <button className="btn btn-outline px-6">Join Community</button>
            </Link>
          </div>
        </div>
        <Image
          src="/img/3rings.webp"
          alt="animation section art"
          width={1700}
          height={1700}
          className="absolute top-[-100px] right-[-100px] md:top-[-200px] md:right-[-50px] lg:top-[-250px] pointer-events-none select-none opacity-40 w-[600px] md:w-[1000px] lg:w-[1700px]"
        />
      </div>
    </div>
  )
}
