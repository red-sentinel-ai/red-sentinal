'use client'

import { motion } from 'framer-motion'
import { Twitter, Heart, MessageCircle, Repeat2 } from 'lucide-react'

const TWEETS = [
  {
    id: 1,
    author: 'AI_Researcher',
    handle: '@ai_researcher',
    content:
      'Just discovered SUI Sentinel - this is exactly what the AI security space needed! The concept of prompt-first security is revolutionary. 🔥',
    likes: 234,
    retweets: 89,
    replies: 45,
    time: '2h',
  },
  {
    id: 2,
    author: 'CryptoBuilder',
    handle: '@cryptobuilder',
    content:
      'Deployed my first AI agent on SUI Sentinel yesterday. Already earned 50 SUI from attack fees! The economics are brilliant 💰',
    likes: 156,
    retweets: 67,
    replies: 23,
    time: '4h',
  },
  {
    id: 3,
    author: 'PromptHacker',
    handle: '@prompthacker',
    content:
      'Finally broke through a Level 5 Sentinel after 20 attempts! The prize pool was worth it. This platform is addictive 🎯',
    likes: 189,
    retweets: 45,
    replies: 78,
    time: '6h',
  },
  {
    id: 4,
    author: 'Web3Security',
    handle: '@web3security',
    content:
      'SUI Sentinel is pioneering the future of AI auditing. Every prompt engineer should be testing their skills here.',
    likes: 312,
    retweets: 123,
    replies: 56,
    time: '8h',
  },
  {
    id: 5,
    author: 'BlockchainDev',
    handle: '@blockchaindev',
    content:
      'The gamification of AI security is genius! SUI Sentinel makes learning prompt engineering fun and profitable.',
    likes: 278,
    retweets: 94,
    replies: 67,
    time: '10h',
  },
  {
    id: 6,
    author: 'AIEthicist',
    handle: '@aiethicist',
    content:
      'Love how SUI Sentinel is making AI systems more robust through adversarial testing. This is the future of AI safety.',
    likes: 445,
    retweets: 156,
    replies: 89,
    time: '12h',
  },
]

const EXTENDED_TWEETS = [...TWEETS, ...TWEETS, ...TWEETS]

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

        {/* Sliding tweets container */}
        <div className="relative">
          {/* Gradient overlays for smooth fade effect */}
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
                <div className="border border-[#558eb466] bg-[#12121266] backdrop-blur-sm rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="size-12 bg-gradient-to-r from-[#558EB4] to-[#1388D5] rounded-full flex items-center justify-center flex-shrink-0 shadow-glow-blue">
                      <Twitter className="size-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white truncate">{tweet.author}</h4>
                        <span className="text-[#558EB4] text-sm">{tweet.handle}</span>
                        <span className="text-gray-500 text-sm">·</span>
                        <span className="text-gray-500 text-sm">{tweet.time}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-6 text-sm">{tweet.content}</p>

                  <div className="flex items-center justify-between text-gray-400 pt-4 border-t border-[#558EB4]/20">
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
