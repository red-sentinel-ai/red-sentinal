'use client'

import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_TELEGRAM_URL } from '@/constants'

export const AnimationSection = () => {
  // const containerRef = useRef<HTMLDivElement>(null)
  // const { scrollYProgress } = useScroll({
  //   target: containerRef,
  //   offset: ['start start', 'end start'],
  // })

  // const x = useTransform(scrollYProgress, [0, 0.6], ['0px', '400px'])
  // const y = useTransform(scrollYProgress, [0, 0.6], ['0px', '700px'])

  // const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  // const springX = useSpring(x, springConfig)
  // const springY = useSpring(y, springConfig)

  return (
    <div
      // ref={containerRef}
      className="relative flex items-center max-w-[1340px] mx-auto pt-12 md:py-24 overflow-hidden"
    >
      <div className="relative z-10 w-full text-left">
        <h2 className="text-[28px] md:text-[48px] leading-tight font-medium">
          Sui Sentinel lets you
          <span className="text-[#C871FF]"> red-team, audit, and defend AI </span> models through
          real-world attacks while earning digital rewards for your mastery
        </h2>
        <p className="max-w-[984px] text-base md:text-2xl mt-8 mx-auto md:mx-0 text-[#5F5C5C]">
          Built for AI builders, businesses, and prompt engineers those shaping the next generation
          of intelligent systems.
        </p>
        <div className="flex flex-row gap-6 mt-10 justify-start">
          <Link
            href={SUI_SENTINEL_APP_URL}
            target="_blank"
          >
            <button className="btn btn-black px-6">Explore Platform</button>
          </Link>
          <Link
            href={SUI_SENTINEL_TELEGRAM_URL}
            target="_blank"
          >
            <button className="btn btn-outline px-6">Join Telegram</button>
          </Link>
        </div>
      </div>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] z-0 opacity-40 md:opacity-100"
      >
        <source
          src="/videos/threeCircles.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
