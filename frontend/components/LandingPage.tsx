'use client'
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
        {/* Top Secret Watermark */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 select-none opacity-[0.03]">
          <span className="font-display text-[8rem] font-bold uppercase tracking-widest text-on-surface rotate-[-15deg]">
            TOP SECRET
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 select-none opacity-[0.03]">
          <span className="font-display text-[6rem] font-bold uppercase tracking-widest text-on-surface rotate-[15deg]">
            CLASSIFIED
          </span>
        </div>

        <div className="mx-auto max-w-[933px]">
          <motion.div
            className="z-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h1 className="font-display text-xl font-medium text-on-surface sm:text-[32px] md:text-[40px] lg:text-[48px]">
              Ship AI Agents Without Fear
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-sm text-on-surface-variant sm:text-base md:text-lg">
              The first crowdsourced AI red teaming platform on Sui. Deploy agents, break defenses,
              and earn instant rewards.
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
                    className="h-auto w-full object-contain opacity-80"
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
                <p className="font-display text-base font-medium leading-normal text-on-surface md:text-lg lg:text-[2rem]">
                  DEFEND
                </p>
              </div>

              <div className="mx-auto flex max-w-[280px] md:max-w-[394px]">
                <div className="gradient-border blue"></div>
                <div className="gradient-border blue rotate-180"></div>
              </div>

              <div className="my-3 md:my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-xs text-on-surface-variant md:ps-0 md:text-base">
                  <li>Launch your AI as a Sentinel with staked rewards</li>
                  <li>Earn SUI from every failed attack attempt</li>
                  <li>Get real adversarial data to harden your defenses</li>
                </ul>
              </div>
              <div>
                <Link
                  href="/defend"
                  className="btn-primary flex min-h-[48px] w-full items-center justify-center rounded-lg p-2 text-lg md:min-h-[62px] md:text-2xl"
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
                    className="h-auto w-full object-contain opacity-80"
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
                <p className="font-display text-base font-medium leading-normal text-on-surface md:text-lg lg:text-[2rem]">
                  ATTACK
                </p>
              </div>

              <div className="mx-auto flex max-w-[280px] md:max-w-[394px]">
                <div className="gradient-border red"></div>
                <div className="gradient-border red rotate-180"></div>
              </div>

              <div className="my-3 md:my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-xs text-on-surface-variant md:ps-0 md:text-base">
                  <li>Use prompt engineering to jailbreak AI defenses</li>
                  <li>Win instant SUI payouts for verified exploits</li>
                  <li>Build your rep as an elite AI red teamer</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/attack"
                  className="btn-secondary flex min-h-[48px] w-full items-center justify-center rounded-lg border border-tertiary/50 bg-tertiary/10 p-2 text-lg text-on-surface transition-all hover:bg-tertiary/20 md:min-h-[62px] md:text-2xl"
                >
                  Start Attacking
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Ambient glow background */}
        <div className="absolute left-1/2 top-[23%] h-[600px] w-full -translate-x-1/2 rounded-full bg-primary/5 blur-3xl md:w-[1000px]"></div>
      </motion.div>
    </AnimatePresence>
  )
}
