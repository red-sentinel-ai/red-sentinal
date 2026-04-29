'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight - 80

      setIsScrolled(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="text-center text-white h-11 flex items-center justify-center bg-linear-to-r from-black/15 to-[rgba(102,102,102,0)] p-2 text-xs md:text-base">
        <h3 className="text-black font-medium">
          Red Sentinel is fully audited by{' '}
          <a href="https://osec.io/" target="_blank" className="underline">
            OtterSec
          </a>{' '}
          and live on Sui & Solana Mainnet.
        </h3>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between h-16">
          <div className="relative z-50">
            <Link className="shrink-0 flex items-center gap-2" href="/">
              <Image
                src="/icons/logo_large.svg"
                alt="shield"
                style={{ objectFit: 'contain' }}
                height={40}
                width={160}
                quality={100}
                className="transition-all duration-300"
              />
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <AnimatePresence>
              {/* {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:flex items-center gap-4"
                >
                  <div className="flex gap-6 shrink-0 w-auto">
                    <Link
                      href={SUI_SENTINEL_APP_URL}
                      target="_blank"
                    >
                      <button className="px-6 btn font-bold btn-white shadow-v1">Launch App</button>
                    </Link>
                    <Link
                      href={SUI_SENTINEL_DOCS_URL}
                      target="_blank"
                    >
                      <button className="px-6 btn font-bold btn-outline-white backdrop-blur-md">
                        Docs
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )} */}

              {/* <Link
                href={SUI_SENTINEL_DOCS_URL}
                target="_blank"
                className="px-6 btn font-medium text-sm btn-outline rounded-[25px]! flex items-center justify-center h-[50px] min-h-[50px]!"
              >
                Support on X
              </Link> */}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
