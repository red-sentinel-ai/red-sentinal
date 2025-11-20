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
      <div className="relative z-10 max-w-7xl mx-auto md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16 px-4 md:px-10"
        >
          <div className="badge-pink w-fit mb-6">• Offerings</div>
          <h2 className="text-2xl md:text-[48px] font-medium leading-tight">
            Whether you’re deploying your own Sentinel or testing one built for battle, every move
            shapes the future of <span className="text-[#C871FF]">Sui Sentinel security.</span>
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 md:px-10"
        >
          <div className="relative p-3 md:p-8 flex flex-col justify-between min-h-[300px] border border-black md:border-r-0">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Custom AI</h3>

              <p className="text-base md:text-[20px] leading-relaxed text-[#939393]">
                Use battle-tested AI models built by the community. Challenge them, test their
                strength, and earn rewards for every exploit discovered.
              </p>

              <div className="min-h-[280px] md:min-h-[300px]">
                <Image
                  src="/img/customAIArt.png"
                  alt="custom ai"
                  width={500}
                  height={500}
                  className="w-full max-w-md h-auto mx-auto absolute top-[5%] md:w-[500px] md:h-[500px] md:max-w-none left-1/2 -translate-x-1/2"
                />
              </div>
            </div>
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
              className="mt-1"
            >
              <button className="btn btn-outline px-8 mt-12 md:mt-0">Attack Now</button>
            </Link>
          </div>

          <div className="relative p-3 md:p-8 border border-black border-t-0 md:border-t md:border-t-black md:border-l flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-xl md:text-[32px] font-medium mb-6">Deploy Your Sentinel</h3>
              <p className="text-base md:text-[20px] leading-relaxed text-[#939393]">
                Launch your own AI model into the Sentinel network. Let the world attack it and earn
                while it evolves.
              </p>

              <div className="min-h-0 md:min-h-[300px]">
                <Image
                  src="/img/deploySentinelArt.png"
                  alt="deploy sentinel"
                  width={400}
                  height={400}
                  className="relative w-full max-w-xs h-auto mx-auto my-6 md:absolute md:bottom-[2%] md:w-[400px] md:h-[400px] md:max-w-none md:my-0"
                />
              </div>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link
                href={SUI_SENTINEL_APP_URL}
                target="_blank"
                className="mt-1"
              >
                <button className="btn btn-outline px-7">Deploy Now!</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
