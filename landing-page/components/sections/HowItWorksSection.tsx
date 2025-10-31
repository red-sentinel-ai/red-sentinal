'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = {
  deploy: {
    title: 'Deploy',
    description: 'Launch your AI Sentinel and stake funds to defend against real attacks.',
  },
  attack: {
    title: 'Attack & Earn',
    description: 'Pay a small fee to test others sentinels. Earn rewards for valid exploits.',
  },
  evolve: {
    title: 'Evolve & Profit',
    description:
      'Sentinels that survive grow smarter. Creators earn a share of every test, turning AI defense into passive income.',
  },
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative"
    >
      <div className="py-24 relative text-black bg-[#F7F9FF] z-10">
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16 flex flex-col items-center"
          >
            <div className="bg-gradient-to-r from-[#B9CDFF] to-[#E3EBFF] px-6 py-1 rounded-full mb-4 border border-black">
              {' '}
              • how it works{' '}
            </div>
            <h2 className="text-3xl md:text-[48px] font-medium mb-4">
              Sui Sentinel&apos;s Gamified AI Security
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-[20px]">
              Attack, defend, and evolve in an ecosystem where every move strengthens the network
              and earns real rewards for mastery.
            </p>
          </motion.div>
          <div
            style={{ backgroundImage: 'url("/img/lines.png")' }}
            className="relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative hidden lg:grid grid-cols-5 grid-rows-3 gap-8 items-center text-black min-h-[760px] px-8"
            >
              {/* Text Sections */}
              <div className="col-span-1 row-start-2 text-right flex flex-col h-full justify-end">
                <h3 className="mb-1 text-2xl">{features.attack.title}</h3>
                <p>{features.attack.description}</p>
              </div>
              <div className="col-span-1 col-start-5 row-start-1 text-left h-full justify-end flex flex-col">
                <h3 className="mb-1 text-2xl">{features.deploy.title}</h3>
                <p>{features.deploy.description}</p>
              </div>
              <div className="col-span-1 col-start-5 row-start-3 text-left flex flex-col justify-start h-full">
                <h3 className="mb-1 text-2xl">{features.evolve.title}</h3>
                <p>{features.evolve.description}</p>
              </div>

              {/* Central Image */}
              <div className="col-span-3 col-start-2 row-span-3 flex items-center justify-center">
                <Image
                  src="/img/threeCubes.png"
                  alt="Deploy, Attack, and Evolve your AI Sentinel"
                  width={288}
                  height={503}
                  className="object-contain"
                />
              </div>

              <Image
                src="/img/arrowLeft.png"
                alt="Arrow pointing from Deploy text to the top cube"
                width={258}
                height={258}
                className="absolute top-[17%] right-[26%] object-contain"
              />
              <Image
                src="/img/arrowRight.png"
                alt="Arrow pointing from Attack & Earn text to the middle cube"
                width={258}
                height={258}
                className="absolute top-[56%] -translate-y-1/2 left-[23%] object-contain"
              />
              <Image
                src="/img/arrowRightBottom.png"
                alt="Arrow pointing from Evolve & Profit text to the bottom cube"
                width={258}
                height={258}
                className="absolute bottom-[12%] right-[28%] object-contain"
              />
            </motion.div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex flex-col gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative md:w-full max-w-xs md:max-w-md"
              >
                <Image
                  src="/img/threeCubes.png"
                  alt="Attack, Deploy, and Evolve features illustrated with cubes"
                  width={500}
                  height={500}
                  className="w-full h-auto"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col gap-8 text-center"
              >
                <div>
                  <h3 className="mb-1 text-2xl">{features.deploy.title}</h3>
                  <p>{features.deploy.description}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-2xl">{features.attack.title}</h3>
                  <p>{features.attack.description}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-2xl">{features.evolve.title}</h3>
                  <p>{features.evolve.description}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[-22%] left-1/2 -translate-x-1/2">
        <Image
          src="/img/fullCircle.png"
          width={535}
          height={802}
          alt="full circle"
        />
      </div>
    </section>
  )
}
