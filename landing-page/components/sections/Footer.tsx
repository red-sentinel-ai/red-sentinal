'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, BookOpen } from 'lucide-react'
import Image from 'next/image'
import { SUI_SENTINEL_DOCS_URL, SUI_SENTINEL_GITHUB_URL, SUI_SENTINEL_X_URL } from '@/constants'

export function Footer() {
  return (
    <footer className="relative py-16 border-t border-[#383838]">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-8 h-11">
                <Image
                  src="/icons/shield.png"
                  alt="shield"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="text-2xl font-bold text-white">SUI Sentinel</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md mb-6">
              The ultimate battle arena for AI security. Test, defend, and attack autonomous AI
              agents in the first prompt-first security platform on the Sui blockchain.
            </p>
            <div className="flex max-w-[300px]">
              <div className="blue gradient-border"></div>
              <div className="blue gradient-border rotate-180"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-[#558EB4] transition-colors flex items-center gap-2"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#vision"
                  className="text-gray-400 hover:text-[#558EB4] transition-colors flex items-center gap-2"
                >
                  Vision
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="text-gray-400 hover:text-[#558EB4] transition-colors flex items-center gap-2"
                >
                  Community
                </a>
              </li>
              <li>
                <Link
                  href={SUI_SENTINEL_DOCS_URL}
                  target="_blank"
                  className="text-gray-400 hover:text-[#558EB4] transition-colors flex items-center gap-2"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-bold mb-6">Connect</h3>
            <div className="flex gap-3 mb-6">
              <Link
                href={SUI_SENTINEL_X_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue "
              >
                <Image
                  src="/icons/x.png"
                  alt="shield"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href={SUI_SENTINEL_GITHUB_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue"
              >
                <Github className="size-5 text-white" />
              </Link>

              <Link
                href={SUI_SENTINEL_DOCS_URL}
                target="_blank"
                className="size-12 border-[3px] border-white/20 bg-black hover:border-white/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-glow-blue"
              >
                <BookOpen className="size-5 text-white" />
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-[#383838] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">All Rights Reserved @Cyphronix Software</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a
              href="#"
              className="hover:text-[#558EB4] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-[#558EB4] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-[#558EB4] transition-colors"
            >
              Security
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
