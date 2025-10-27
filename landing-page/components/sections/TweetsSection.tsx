'use client'

import { motion } from 'framer-motion'
import { EXTENDED_TWEETS, TWEETS } from '@/constants'

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
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800">Community Buzz</h2>
        </motion.div>

        <div className="relative">
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -100 * TWEETS.length + '%'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 60,
                ease: 'linear',
              },
            }}
          >
            {EXTENDED_TWEETS.map((tweet, index) => (
              <div
                key={`${tweet.id}-${index}`}
                className="flex-shrink-0 w-80 sm:w-96"
              >
                <div className="relative bg-gradient-to-r from-[#FFFFFF00] to-[#AD90BC33] backdrop-blur-md rounded-md p-6 h-full flex flex-col text-gray-800 border border-[#D2C3FC]">
                  <span className="absolute top-5 right-6 text-sm text-gray-600">{tweet.time}</span>
                  <div className="flex items-center gap-4">
                    {/* This is the placeholder for the author's image */}
                    <div className="size-12 bg-white/50 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{tweet.author}</h4>
                      <span className="text-indigo-600 text-sm">{tweet.handle}</span>
                    </div>
                  </div>
                  <p className="leading-relaxed mt-6 text-lg">&ldquo;{tweet.content}&rdquo;</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
