'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Skranji } from 'next/font/google'

const skranji = Skranji({
  weight: ['400', '700'],
  subsets: ['latin'],
})

const REEL_HEIGHT = 130
const TILE_HEIGHT = 46

const getNumberColor = (num: number) => {
  const colors: { [key: number]: string } = {
    0: '#3BF0FF',
    1: '#F2A4FF',
    2: '#A06BFF',
    3: '#F2A4FF',
    4: '#A06BFF',
    5: '#3BF0FF',
    6: '#A06BFF',
    7: '#3BF0FF',
    8: '#F2A4FF',
    9: '#3BF0FF',
  }
  return colors[num] || '#3BF0FF'
}

const numbers = [...Array(10).keys(), ...Array(10).keys(), ...Array(10).keys(), ...Array(10).keys()]

type SlotReelProps = {
  value: number
  isSpinning: boolean
  delay: number
}

export const SlotReel = ({ value, isSpinning, delay }: SlotReelProps) => {
  const controls = useAnimation()
  const hasSpun = useRef(false)

  const safeValue = typeof value === 'number' && !isNaN(value) ? Math.abs(value % 10) : 0

  const getPositionForValue = (val: number) => {
    const targetIndex = 20 + val
    return -(targetIndex * TILE_HEIGHT) + REEL_HEIGHT / 2 - TILE_HEIGHT / 2
  }

  useEffect(() => {
    const handleAnimation = async () => {
      if (isSpinning) {
        hasSpun.current = true
        await controls.start({
          y: [0, -10 * TILE_HEIGHT],
          transition: {
            duration: 0.2,
            ease: 'linear',
            repeat: Infinity,
          },
        })
      } else {
        const finalY = getPositionForValue(safeValue)

        if (!hasSpun.current) {
          controls.set({ y: finalY })
          return
        }

        await new Promise(resolve => setTimeout(resolve, delay * 1000))

        await controls.start({
          y: finalY,
          transition: {
            duration: 0.8,
            ease: [0.2, 0.8, 0.2, 1],
            type: 'spring',
            stiffness: 60,
            damping: 15,
          },
        })
      }
    }

    handleAnimation()
  }, [isSpinning, safeValue, delay, controls])

  return (
    <div className="relative w-[60px] overflow-hidden" style={{ height: `${REEL_HEIGHT}px` }}>
      <motion.div
        animate={controls}
        initial={{ y: getPositionForValue(safeValue) }}
        className="flex flex-col items-center"
      >
        {numbers.map((num, i) => (
          <div
            key={i}
            className={`m-[5px] flex w-[40px] select-none items-center justify-center text-[32px] font-bold ${skranji.className}`}
            style={{
              height: `${TILE_HEIGHT - 10}px`,
              color: getNumberColor(num),
            }}
          >
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
