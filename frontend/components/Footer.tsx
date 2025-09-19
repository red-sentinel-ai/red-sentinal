'use client'

import { motion } from 'framer-motion'
import { BookOpen, Github } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  NAUTILUS_URL,
  SUI_SENTINEL_DOCS_URL,
  SUI_SENTINEL_GITHUB_URL,
  SUI_SENTINEL_TELEGRAM_URL,
  SUI_SENTINEL_X_URL,
} from '@/constants'

const Footer = () => {
  const pathname = usePathname()
  const shouldHideFooter = pathname.startsWith('/attack/')

  if (shouldHideFooter) {
    return null
  }

  return (
    <footer className="mt-auto relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="text-[#B5B5B5] text-sm md:text-base leading-relaxed">
                <span>Powered by </span>
                <a
                  href={NAUTILUS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#558EB4] hover:text-[#1388D5] transition-all duration-300 underline decoration-[#558EB4]/50 hover:decoration-[#1388D5] font-medium"
                >
                  Nautilus Framework
                </a>
                <span> • Secured by TEE</span>
              </div>
              <div className="text-[#888888] text-xs md:text-sm">
                All Rights Reserved @Cyphronix Software
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-end space-y-4"
          >
            <div className="text-center md:text-right">
              <h3 className="text-white font-bold text-lg mb-2 bg-gradient-to-r from-white to-[#558EB4] bg-clip-text text-transparent">
                Connect With Us
              </h3>
            </div>

            <div className="flex gap-3">
              <Link
                href={SUI_SENTINEL_X_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue "
              >
                <Image
                  src="/icons/x.png"
                  alt="X (Twitter)"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </Link>

              <Link
                href={SUI_SENTINEL_GITHUB_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue "
              >
                <Github className="size-5 text-white group-hover:text-[#558EB4] group-hover:scale-110 transition-all duration-300" />
              </Link>

              <Link
                href={SUI_SENTINEL_DOCS_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue "
              >
                <BookOpen className="size-5 text-white group-hover:text-[#558EB4] group-hover:scale-110 transition-all duration-300" />
              </Link>

              <Link
                href={SUI_SENTINEL_TELEGRAM_URL}
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue "
                target="_blank"
              >
                <Image
                  src="/icons/telegram.png"
                  alt="X (Twitter)"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
            </div>

            <Link
              href={SUI_SENTINEL_TELEGRAM_URL}
              target="_blank"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0088cc] to-[#0077b5] rounded-full text-white font-medium hover:from-[#0077b5] hover:to-[#006699] transition-all duration-300 shadow-lg hover:shadow-xl transform group"
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
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
