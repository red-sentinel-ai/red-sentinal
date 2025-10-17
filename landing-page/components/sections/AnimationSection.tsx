'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export const AnimationSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 0.6], ['0px', '400px'])
  const y = useTransform(scrollYProgress, [0, 0.6], ['0px', '700px'])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  return (
    <div
      ref={containerRef}
      className="relative flex items-center min-h-[80vh]"
    >
      <div className="relative z-10 max-w-3xl">
        <h2 className="text-[48px] leading-tight font-medium">
          Enterprise-Grade AI Audits. Stress-test your AI models with real-world attacks and
          actionable insights.
        </h2>
        <div className="flex gap-6 mt-10">
          <button className="btn btn-black">Explore</button>
          <button className="btn btn-outline">Join Telegram</button>
        </div>
      </div>

      <motion.div
        style={{ x: springX, y: springY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src="/gifs/circle1.gif"
          width={400}
          height={400}
          alt="circle 1 animation"
          unoptimized
        />
      </motion.div>
    </div>
  )
}
