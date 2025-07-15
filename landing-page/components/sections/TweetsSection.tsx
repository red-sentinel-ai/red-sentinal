'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'
import Image from 'next/image'

const TWEETS = [
  {
    id: 1,
    author: 'Andrej Karpathy',
    handle: '@karpathy',
    content: 'The hottest new programming language is English',
    likes: '44k',
    retweets: '7k',
    replies: '1.1k',
    time: 'Jan 24, 2023',
  },
  {
    id: 2,
    author: 'Balaji',
    handle: '@balajis',
    content: 'Tech is limited by founders. AI is limited by prompters.',
    likes: '2.8k',
    retweets: 294,
    replies: 256,
    time: 'Jun 24, 2025',
  },
  {
    id: 3,
    author: 'Guillermo Rauch',
    handle: '@rauchg',
    content: 'Prompting is the new literacy',
    likes: 913,
    retweets: 142,
    replies: 107,
    time: 'jun 18, 2025',
  },
]

const EXTENDED_TWEETS = [...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS, ...TWEETS]

export function TweetsSection() {
  return (
    <section
      id="community"
      className="py-24 relative overflow-hidden max-w-screen"
    >
      <div className="relative z-10 mx-auto max-w-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Community Buzz
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what the community is saying
          </p>
          <p className="text-lg text-gray-500 mt-2">Real voices from the battlefield</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6"
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
                <div className="border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="size-12 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center flex-shrink-0 shadow-glow-blue">
                      <Image
                        src="/icons/x.png"
                        alt="shield"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-semibold text-white truncate">{tweet.author}</h4>
                          <span className="text-[#558EB4] text-sm">{tweet.handle}</span>
                        </div>
                        <span className="text-gray-500 text-sm whitespace-nowrap">
                          {tweet.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-6 text-sm">{tweet.content}</p>

                  <div className="flex items-center justify-between text-gray-400 pt-4 border-t border-[#558EB4]/20 mt-auto">
                    <div className="flex items-center gap-2 hover:text-[#558EB4] transition-colors cursor-pointer">
                      <MessageCircle className="size-4" />
                      <span className="text-sm">{tweet.replies}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-green-400 transition-colors cursor-pointer">
                      <Repeat2 className="size-4" />
                      <span className="text-sm">{tweet.retweets}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-red-400 transition-colors cursor-pointer">
                      <Heart className="size-4" />
                      <span className="text-sm">{tweet.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
