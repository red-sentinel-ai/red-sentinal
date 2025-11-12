'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              className="mr-1 xl:mr-4 flex-shrink-0 flex items-center gap-2"
              href="/"
            >
              <Image
                src="/icons/logo_large.png"
                alt="shield"
                style={{ objectFit: 'contain' }}
                height={49}
                width={198}
                quality={100}
              />
            </Link>
          </motion.div>
          {/* <div>
            <Link
              href="/careers"
              className="underline  hover:no-underline"
            >
              Careers
            </Link>
          </div> */}

          {/* <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#vision"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Vision
            </a>
            <a
              href={SUI_SENTINEL_DOCS_URL}
              target="_blank"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </a>

            <Link
              href={SUI_SENTINEL_TELEGRAM_URL}
              target="_blank"
              className="flex items-center w-fit gap-3 px-6 py-3 bg-gradient-to-r from-[#0088cc] to-[#0077b5] rounded-full text-white font-medium hover:from-[#0077b5] hover:to-[#006699] transition-all duration-300 shadow-lg hover:shadow-xl transform group"
            >
              <Image
                src="/icons/telegram.png"
                alt="Telegram"
                width={20}
                height={20}
                className="group-hover:scale-110 transition-transform duration-300 filter brightness-0 invert"
              />
              <span className="text-sm font-semibold">Join Telegram</span>
            </Link>
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
            >
              <button className=" border border-[#383838] hover:border-[#424242] transition-colors font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-white/90">
                Launch App
              </button>
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button> */}
        </div>

        {/* {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-gray-700/30 py-4"
          >
            <div className="flex flex-col gap-4 px-4">
              <Link
                href="#how-it-works"
                className="text-gray-300 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#vision"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Vision
              </Link>

              <Link
                href={SUI_SENTINEL_DOCS_URL}
                target="_blank"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href={SUI_SENTINEL_APP_URL}
                target="_blank"
                className="w-full"
              >
                <button className="border border-[#383838] hover:border-[#424242] transition-colors font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-white/90 w-full">
                  Launch App
                </button>
              </Link>
            </div>
          </motion.div>
        )} */}
      </div>
    </motion.nav>
  )
}
