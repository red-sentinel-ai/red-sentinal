'use client'

import { motion } from 'framer-motion'

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
      className="py-24 relative text-black"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="bg-[#D9D9D9] px-4 py-1 rounded-full mb-4">
            • how it works
          </div>
          <h2 className="text-[48px] font-medium mb-4">
            Sui Sentinel's Gamified AI Security
          </h2>
          <p className="max-w-3xl mx-auto text-[20px]">
            We turned defense into a game of intelligence. <br /> Attack, defend, and evolve in an
            ecosystem where every move strengthens the network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-5 grid-rows-3 gap-8 items-center text-black bg-center bg-no-repeat bg-contain min-h-[760px] px-8"
          style={{ backgroundImage: "url('/img/threeCubes.png')" }}
        >
          <div className="col-span-1 row-start-2 text-[24px]">
            <h3 className="mb-1">{features.attack.title}</h3>
            <p>{features.attack.description}</p>
          </div>

          <div className="col-span-3 col-start-2 row-span-3"></div>

          <div className="col-span-1 col-start-5 row-start-1 text-[24px]">
            <h3 className="mb-1">{features.deploy.title}</h3>
            <p>{features.deploy.description}</p>
          </div>

          <div className="col-span-1 col-start-5 row-start-3 text-[24px]">
            <h3 className="mb-1">{features.earn.title}</h3>
            <p>{features.earn.description}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}