'use client'

import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_TELEGRAM_URL } from '@/constants'
import Image from 'next/image'

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
      className="relative flex items-center min-h-[80vh] py-16 md:py-0"
    >
      <div className="relative z-10 w-full text-center md:text-left">
        <h2 className="text-3xl md:text-[48px] leading-tight font-medium">
          Sui Sentinel lets you stress-test, audit, and defend AI models through real-world attacks
          while earning digital rewards for your mastery.
        </h2>
        <p className="max-w-[984px] text-lg md:text-2xl mt-8 mx-auto md:mx-0">
          Built for AI builders, businesses, and prompt engineers those shaping the next generation
          of intelligent systems.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 mt-10 justify-center md:justify-start">
          <Link
            href={SUI_SENTINEL_APP_URL}
            target="_blank"
          >
            <button className="btn btn-black">Explore Platform</button>
          </Link>
          <Link
            href={SUI_SENTINEL_TELEGRAM_URL}
            target="_blank"
          >
            <button className="btn btn-outline">Join Telegram</button>
          </Link>
        </div>
      </div>

      {/* <motion.img
        style={{ x: springX, y: springY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[360px] md:w-[360px] md:h-[540px] z-0 opacity-40 md:opacity-100"
        src="/gifs/circle.gif"
        width={360}
        height={540}
        alt="circle animation"
      /> */}

      <Image
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] z-0 opacity-40 md:opacity-100"
        src="/gifs/threeCircle.gif"
        width={776}
        height={720}
        alt="circle animation"
        quality={1}
      />
    </div>
  )
}
