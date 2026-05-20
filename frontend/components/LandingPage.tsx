import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingPage = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="relative mx-auto w-full max-w-[1900px] px-4 pt-8 md:pt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-[933px]">
          <motion.div
            className="z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h1 className="text-xl font-medium text-text sm:text-[32px] md:text-[40px] lg:text-[48px]">
              Prepare Yourself for Age of Agents
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-sm sm:text-base md:text-lg">
              Agents are everywhere. we all need to upskill to make most of this new era. learn by doing. Red Sentinel is the ultimate playground to build, defend, and attack with AI agents. Are you ready to test your skills and earn rewards in the most exciting way possible?
            </p>
          </motion.div>

          <motion.div
            className="mx-4 mt-6 rounded-md bg-[var(--color-danger)] py-2.5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white sm:text-sm">
              Red Sentinel is live on{' '}
              <strong className="font-extrabold">SUI</strong>
              <span className="mx-2 opacity-60">·</span>
              <strong className="font-extrabold">SOLANA</strong>
              <span className="mx-2 opacity-60">·</span>
              <strong className="font-extrabold">BNB Chain</strong>
            </p>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 justify-center gap-8 overflow-hidden px-4 pb-4 pt-12 text-center md:gap-9 md:pt-20 lg:grid-cols-2">
            {/* DEFEND Card */}
            <motion.div
              className="robo-card defender group col-span-1 rounded-lg p-2 backdrop-blur-[0.1px] lg:rounded-2xl lg:p-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative mx-auto w-[240px] md:w-[368px]">
                {/* Background Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/img/defend_bg.png"
                    width={411}
                    height={546}
                    alt=""
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                {/* Robot Image */}
                <div className="relative z-10 -mt-[40px] md:-mt-[70px]">
                  <Image
                    src="/img/robot_defend.png"
                    width={368}
                    height={546}
                    alt="Defender Robot"
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="my-2 flex items-center justify-center gap-2">
                <p className="text-base font-medium leading-normal md:text-lg lg:text-[2rem]">
                  DEFEND
                </p>
              </div>

              <div className="mx-auto flex max-w-[280px] md:max-w-[394px]">
                <div className="gradient-border blue"></div>
                <div className="gradient-border blue rotate-180"></div>
              </div>

              <div className="my-3 md:my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-xs md:ps-0 md:text-base">
                  <li>Build an AI that can&apos;t be broken.</li>
                  <li>Earn from every attack while it holds.</li>
                  <li>Survive 14 days. Keep everything.</li>
                </ul>
              </div>
              <div>
                <Link
                  href="/defend"
                  className="btn flex min-h-[48px] w-full items-center justify-center rounded-[8px] bg-[var(--color-gold-primary)] p-2 text-lg text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-dark)] md:min-h-[62px] md:text-2xl"
                >
                  Deploy Sentinel
                </Link>
              </div>
            </motion.div>

            {/* ATTACK Card */}
            <motion.div
              className="robo-card attacker group col-span-1 rounded-lg p-2 backdrop-blur-[0.1px] lg:rounded-2xl lg:p-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative mx-auto w-[240px] md:w-[368px]">
                {/* Background Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/img/attack_bg.png"
                    width={411}
                    height={546}
                    alt=""
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                {/* Robot Image */}
                <div className="relative z-10 -mt-[40px] md:-mt-[70px]">
                  <Image
                    src="/img/robot_attack.png"
                    width={368}
                    height={546}
                    alt="Attacker Robot"
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="my-2 flex items-center justify-center gap-2">
                <p className="text-base font-medium leading-normal md:text-lg lg:text-[2rem]">
                  ATTACK
                </p>
              </div>

              <div className="mx-auto flex max-w-[280px] md:max-w-[394px]">
                <div className="gradient-border red"></div>
                <div className="gradient-border red rotate-180"></div>
              </div>

              <div className="my-3 md:my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-xs md:ps-0 md:text-base">
                  <li>Find the weakness. Break through. Take the pot.</li>
                  <li>Instant payout. No committees. No delays.</li>
                  <li>On-chain proof of every successful exploit.</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/attack"
                  className="btn flex min-h-[48px] w-full items-center justify-center rounded-[8px] bg-[var(--color-gold-primary)] p-2 text-lg text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-dark)] md:min-h-[62px] md:text-2xl"
                >
                  Start Attacking
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="bg-[var(--color-gold-primary)]/8 absolute left-1/2 top-[23%] h-[600px] w-full -translate-x-1/2 rounded-full blur-3xl md:w-[1000px]"></div>
      </motion.div>
    </AnimatePresence>
  )
}
