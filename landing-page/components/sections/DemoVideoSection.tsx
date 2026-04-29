'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, Shield } from 'lucide-react'
import { useState } from 'react'

const YOUTUBE_VIDEO_ID = '3i2GFOHe5Ao'

export function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section id="demo" className="py-24 relative text-black bg-[#F7F9FF]">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-pink w-fit mx-auto mb-6">• Watch Demo</div>
          <h2 className="text-3xl md:text-[48px] font-medium mb-4">
            See Red Sentinel in <span className="text-[#C871FF]">Action</span>
          </h2>
          <p className="text-lg md:text-xl text-[#5F5C5C] max-w-2xl mx-auto">
            Watch how attackers break AI systems, how defenses evolve, and how rewards flow
            instantly on-chain. The future of AI security, explained in 2 minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative aspect-video bg-[#0d0d1a] rounded-2xl overflow-hidden shadow-2xl">
            {isPlaying && YOUTUBE_VIDEO_ID && (
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                title="Red Sentinel Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}

            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 opacity-30">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #C871FF 0%, transparent 50%),
                                          radial-gradient(circle at 75% 75%, #4F46E5 0%, transparent 50%)`,
                      }}
                    />
                  </div>

                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 w-full h-full group flex flex-col items-center justify-center"
                    aria-label="Play demo video"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/30 group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                    </div>
                    <p className="relative text-white/80 text-sm md:text-base font-medium">
                      Watch the 2-Minute Demo
                    </p>
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white/80">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">2:00</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">Mainnet Demo</span>
                        </div>
                      </div>
                      {!YOUTUBE_VIDEO_ID && (
                        <div className="text-white/60 text-xs md:text-sm">Coming Soon</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#C871FF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#4F46E5]/10 rounded-full blur-2xl pointer-events-none" />
        </motion.div>

        {/* Key Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { title: 'Deploy', desc: 'Launch your AI with staked capital' },
            { title: 'Attack', desc: 'Break Sentinels, earn rewards' },
            { title: 'Verify', desc: 'TEE-based trustless settlement' },
          ].map((point) => (
            <div key={point.title} className="text-center">
              <h4 className="font-medium text-black mb-1">{point.title}</h4>
              <p className="text-sm text-[#5F5C5C]">{point.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
