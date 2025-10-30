'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const features = {
  attack: {
    title: 'Attack',
    description: 'Challenge AI models, find their weaknesses.',
  },
  deploy: {
    title: 'Deploy',
    description: 'Launch your own Sentinel to withstand incoming threats.',
  },
  earn: {
    title: 'Earn',
    description: 'Gain rewards for successful defenses and valuable insights.',
  },
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 relative text-black bg-[#F7F9FF]"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-gradient-to-r from-[#B9CDFF] to-[#E3EBFF] px-6 py-1 rounded-full mb-4">
            {' '}
            • how it works{' '}
          </div>
          <h2 className="text-3xl md:text-[48px] font-medium mb-4">
            Sui Sentinel&apos;s Gamified AI Security
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-[20px]">
            Attack, defend, and evolve in an ecosystem where every move strengthens the network and
            earns real rewards for mastery
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative hidden lg:grid grid-cols-5 grid-rows-3 gap-8 items-center text-black bg-center bg-no-repeat bg-[length:100%] min-h-[760px] px-8"
          style={{ backgroundImage: "url('/img/lines.png')" }}
        >
          <div className="col-span-1 row-start-2">
            <h3 className="mb-1 text-2xl">{features.attack.title}</h3>
            <p>{features.attack.description}</p>
          </div>
          <div className="col-span-3 col-start-2 row-span-3"></div>
          <div className="col-span-1 col-start-5 row-start-1">
            <h3 className="mb-1 text-2xl">{features.deploy.title}</h3>
            <p>{features.deploy.description}</p>
          </div>
          <div className="col-span-1 col-start-5 row-start-3">
            <h3 className="mb-1 text-2xl">{features.earn.title}</h3>
            <p>{features.earn.description}</p>
          </div>
        </motion.div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative w-full max-w-md"
          >
            <Image
              src="/img/threeCubes.png"
              alt="Attack, Deploy, and Earn features illustrated with cubes"
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
              <h3 className="mb-1 text-2xl">{features.attack.title}</h3>
              <p>{features.attack.description}</p>
            </div>
            <div>
              <h3 className="mb-1 text-2xl">{features.deploy.title}</h3>
              <p>{features.deploy.description}</p>
            </div>
            <div>
              <h3 className="mb-1 text-2xl">{features.earn.title}</h3>
              <p>{features.earn.description}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
