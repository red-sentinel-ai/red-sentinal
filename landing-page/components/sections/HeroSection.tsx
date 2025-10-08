'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Zap } from 'lucide-react'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

export function HeroSection() {
  const [typewriterText, setTypewriterText] = useState('')
  const fullText = 'Red-team and secure AI models on the Sui blockchain.'

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
            >
              <span className="bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] bg-clip-text text-transparent">
                SUI Sentinel
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl md:text-4xl font-semibold text-gray-300 min-h-12 flex items-center justify-center"
            >
              {typewriterText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                className="ml-1 text-white"
              >
                |
              </motion.span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            In Web3, AI and large language models (LLMs) are transforming projects, but they’re
            vulnerable to attacks. Malicious prompts can exploit even the best models, leading to
            unintended or harmful outputs. Sui Sentinel is a cutting-edge platform designed to
            audit, stress-test, and red-team AI models, ensuring they’re robust and secure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
            >
              <button className="border border-[#383838] hover:border-[#424242] transition-colors font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-white/90 flex items-center">
                <Zap className="size-5 mr-2" />
                Launch App
                <ArrowRight className="size-5 ml-2" />
              </button>
            </Link>

            <Link
              href={SUI_SENTINEL_DOCS_URL}
              target="_blank"
            >
              <button className="flex items-center gap-2 px-6 py-1.5 bg-[#1A1B1F] rounded-full border border-[#383838] hover:border-[#4c4c4c] transition-colors">
                <BookOpen className="size-5 mr-2" />
                Read Docs
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="size-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-1 h-3 bg-gradient-to-b from-white to-transparent rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
