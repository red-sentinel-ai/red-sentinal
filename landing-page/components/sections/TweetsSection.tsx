'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { EXTENDED_TWEETS, TWEETS, SUI_SENTINEL_TELEGRAM_URL, SUI_SENTINEL_X_URL } from '@/constants'

export function TweetsSection() {
  return (
    <section
      id="community"
      className="py-24 relative overflow-hidden max-w-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/community-bg.png')" }}
    >
      <div className="relative z-10 mx-auto max-w-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-[48px] font-medium text-[#70658C]">Community Buzz</h2>
        </motion.div>

        <div className="relative">
          <motion.div
            className="flex gap-4 md:gap-8"
            animate={{
              x: [0, -22 * TWEETS.length + 'rem'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear',
              },
            }}
          >
            {EXTENDED_TWEETS.map((tweet, index) => (
              <div
                key={`${tweet.id}-${index}`}
                className="flex-shrink-0 w-80 sm:w-96"
              >
                <div className="relative bg-gradient-to-r from-[#FFFFFF00] to-[#AD90BC33] backdrop-blur-xs rounded-md p-3 md:p-6 h-full flex flex-col text-gray-800 border border-[#D2C3FC]">
                  <span className="absolute top-5 right-6">{tweet.time}</span>
                  <div className="flex items-center gap-4">
                    <div className="size-12 md:size-28 bg-white flex items-center justify-center rounded-lg flex-shrink-0">
                      <Image
                        src="/icons/x_black.png"
                        alt="X (Twitter)"
                        width={46}
                        height={46}
                        className="group-hover:scale-110 transition-transform duration-300 w-5 md:w-[46px]"
                        quality={1}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-md md:text-xl">
                      <h4 className="truncate">{tweet.author}</h4>
                      <span className="text-[#2C00FF]">{tweet.handle}</span>
                    </div>
                  </div>
                  <p className="leading-relaxed mt-6 text-md md:text-2xl">
                    &ldquo;{tweet.content}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="md:text-right px-2 md:px-8 mt-24"
        >
          <h3 className="text-xl font-medium mb-6 max-w-[309px] md:max-w-none">
            Join 1000+ Guardians in Telegram & X
          </h3>
          <div className="flex items-center justify-center md:justify-end gap-4 md:mr-16">
            <Link
              href={SUI_SENTINEL_TELEGRAM_URL}
              target="_blank"
            >
              <button className="px-4 md:px-8 py-3 rounded-xl bg-white border border-white text-black font-medium shadow-lg hover:bg-gray-100 transition-colors">
                Explore Telegram
              </button>
            </Link>
            <Link
              href={SUI_SENTINEL_X_URL}
              target="_blank"
            >
              <button className="px-8 py-3 rounded-xl bg-white/30 backdrop-blur-md border border-white text-gray-800 font-medium hover:bg-white/40 transition-colors">
                Support on X
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
