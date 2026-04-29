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
    <div className="relative flex flex-col items-center bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-gold-muted)]/30 px-6 pb-8 pt-6 text-center">
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

        <h3 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">Free Spin Pass Received!</h3>

        <p className="mb-6 text-base text-[var(--color-text-secondary)]">
          {description}
          <br />
          Use your pass to WIN SENTINEL tokens from your profile rewards tab.
        </p>

        <div className="mb-6 rounded-xl border-2 border-dashed border-[#F632F3] bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            🎁 Spin passes may contain boosters with up to{' '}
            <span className="font-bold text-[#F632F3]">100x multipliers</span>
          </p>
        </div>

        <Link
          href="/profile?tab=rewards"
          className={
            buttonVariant === 'primary'
              ? 'inline-block w-full rounded-lg bg-[var(--color-text-primary)] px-6 py-4 font-semibold text-[var(--color-bg-surface)] transition-transform hover:scale-105'
              : 'inline-block w-full rounded-lg border border-[var(--color-border-default)] px-6 py-4 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
          }
        >
          Go to Profile → Spin Now
        </Link>

        <p className="mt-4 text-xs text-[var(--color-text-muted)]">Passes are automatically available in your profile</p>
      </motion.div>
    </div>
  )
}
