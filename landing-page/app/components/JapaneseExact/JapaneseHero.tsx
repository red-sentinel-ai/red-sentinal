'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function JapaneseHero() {
  return (
    <section className="japanese-exact-hero">
      {/* Left */}
      <div className="japanese-exact-hero-left">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Ship AI
          <br />
          Without Fear
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          The crowdsourced AI red teaming platform where security researchers break AI systems
          and get paid. Every attack verified on-chain. Every payout instant.
        </motion.p>

        <motion.div
          className="japanese-exact-preview"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <button className="japanese-exact-play-btn" aria-label="Play video">
            <i className="ri-play-fill"></i>
          </button>

          <div>
            <div className="japanese-exact-date">Est. 2024</div>
            <div className="japanese-exact-meta">Live on Sui Mainnet</div>
          </div>
        </motion.div>

        <motion.div
          className="japanese-exact-socials"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="socials-icons"><i className="ri-twitter-x-line"></i></div>
          <div className="socials-icons"><i className="ri-github-line"></i></div>
          <div className="socials-icons"><i className="ri-discord-line"></i></div>
        </motion.div>
      </div>

      {/* CENTER */}
      <div className="japanese-exact-hero-center">
        <motion.div
          className="japanese-exact-red-sun"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.9 }}
        >
          <Image
            src="/japenese-ui/girl.png"
            alt="Girl"
            width={450}
            height={500}
            className="japanese-exact-hero-img"
            priority
          />
        </motion.div>
      </div>

      {/* RIGHT */}
      <div className="japanese-exact-hero-right">
        <motion.div
          className="japanese-exact-floating-menu"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="icon"><i className="ri-search-line"></i></div>
          <div className="icon"><i className="ri-book-line"></i></div>
          <div className="icon"><i className="ri-user-line"></i></div>
          <div className="icon"><i className="ri-chat-1-line"></i></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <Image
            src="/japenese-ui/cherry.png"
            alt="Cherry Blossom"
            width={550}
            height={300}
            className="japanese-exact-cherry"
          />
        </motion.div>
      </div>
    </section>
  )
}
