'use client'

import { motion } from 'framer-motion'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'

export function OfferingsSection() {
  return (
    <section
      id="offerings"
      className="py-24 relative text-black"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-[#D9D9D9] px-4 py-1 rounded-full text-sm font-medium mb-4 w-fit">
            • Offerings
          </div>
          <h2 className="text-2xl md:text-[48px] font-medium leading-tight">
            Whether you’re deploying your own Sentinel or testing one built for battle, every move
            shapes the future of Sui Sentinel security.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          <div className="p-3 md:p-8 flex flex-col justify-between min-h-[300px] border border-black md:border-r-0">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Custom AI</h3>

              <p className="text-sm md:text-[20px] leading-relaxed">
                Use battle-tested AI models built by the community. Challenge them, test their
                strength, and earn rewards for every exploit discovered.
              </p>

              <div className="min-h-[200px] md:min-h-[300px]">
                <Image
                  src="/img/customAIArt.png"
                  alt="custom ai"
                  width={500}
                  height={500}
                  className="absolute top-[35%]"
                />
              </div>
            </div>
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
              className="mt-1"
            >
              <button className="btn btn-outline">Play Now</button>
            </Link>
          </div>

          <div className="p-3 md:p-8 border border-black border-t-0 md:border-t md:border-t-black md:border-l flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Deploy Your Sentinel</h3>
              <p className="text-sm md:text-[20px] leading-relaxed">
                Launch your own AI model into the Sentinel network. Let the world attack it and earn
                while it evolves.
              </p>
              <div className="min-h-[200px] md:min-h-[300px]">
                <Image
                  src="/img/deploySentinelArt.png"
                  alt="custom ai"
                  width={400}
                  height={400}
                  className="absolute bottom-[2%]"
                />
              </div>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link
                href={SUI_SENTINEL_APP_URL}
                target="_blank"
                className="mt-1"
              >
                <button className="btn btn-outline">Deploy Now!</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
