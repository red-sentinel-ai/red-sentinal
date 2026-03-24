'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface SpinPassPromoProps {
  description: string
  buttonVariant?: 'primary' | 'secondary'
}

export function SpinPassPromo({ description, buttonVariant = 'primary' }: SpinPassPromoProps) {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative flex flex-col items-center bg-gradient-to-b from-white to-pink-50/30 px-6 pb-8 pt-6 text-center">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 inline-block">
          <Image
            src="/img/slot_machine_1x.png"
            alt="Slot machine"
            width={96}
            height={126}
            className="h-24 w-24"
          />
        </div>

        <h3 className="mb-3 text-2xl font-bold text-black">Free Spin Pass Received!</h3>

        <p className="mb-6 text-base text-gray-600">
          {description}
          <br />
          Use your pass to WIN SENTINEL tokens from your profile rewards tab.
        </p>

        <div className="mb-6 rounded-xl border-2 border-dashed border-[#F632F3] bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4">
          <p className="text-sm font-medium text-gray-700">
            🎁 Spin passes may contain boosters with up to{' '}
            <span className="font-bold text-[#F632F3]">100x multipliers</span>
          </p>
        </div>

        <Link
          href="/profile?tab=rewards"
          className={
            buttonVariant === 'primary'
              ? 'inline-block w-full rounded-lg bg-black px-6 py-4 font-semibold text-white transition-transform hover:scale-105'
              : 'inline-block w-full rounded-lg border border-gray-300 px-6 py-4 font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-black'
          }
        >
          Go to Profile → Spin Now
        </Link>

        <p className="mt-4 text-xs text-gray-500">Passes are automatically available in your profile</p>
      </motion.div>
    </div>
  )
}
