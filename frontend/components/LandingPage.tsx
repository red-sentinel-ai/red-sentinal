import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingPage = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="relative mx-auto mt-4 w-full max-w-[1900px] px-4 md:mt-8"
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
              Ship AI Agents Without Fear
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-sm sm:text-base md:text-lg">
              The first crowdsourced AI red teaming platform on Sui. Deploy agents, break defenses,
              and earn instant rewards.
            </p>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 justify-center gap-20 overflow-hidden px-4 pb-4 pt-20 text-center md:gap-9 lg:grid-cols-2">
            <motion.div
              className="robo-card attacker group col-span-1 rounded-lg p-2 backdrop-blur-[0.1px] lg:rounded-2xl lg:p-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative">
                <Image
                  src="/img/robot_defend.png"
                  width={368}
                  height={546}
                  alt="robo"
                  className="relative z-10 mx-auto -mt-[90px] w-[330px] md:w-[368px]"
                />

                <Image
                  src="/img/defend_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 top-[88px] -z-10 -translate-x-1/2"
                />
              </div>

              <div className="my-2 flex items-center justify-center gap-2">
                {/* <div>
                  <Image
                    src="/icons/local_police.png"
                    width={24}
                    height={24}
                    alt="local police icon"
                  />
                </div> */}
                <div>
                  <p className="text-lg font-medium leading-normal lg:text-[2rem]">DEFEND</p>
                </div>
              </div>

              <div className="mx-auto flex max-w-[394px]">
                <div className="gradient-border blue"></div>
                <div className="gradient-border blue rotate-180"></div>
              </div>

              <div className="my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-sm md:ps-0 md:text-base">
                  <li>Launch your AI as a Sentinel with staked rewards</li>
                  <li>Earn SUI from every failed attack attempt</li>
                  <li>Get real adversarial data to harden your defenses</li>
                </ul>
              </div>
              <div>
                <Link
                  href="/defend"
                  className="flex min-h-[62px] w-full items-center justify-center rounded-[8px] border border-secondary_blue_60 bg-secondary_blue p-2 text-2xl text-primary_blue text-white transition-all hover:bg-secondary_blue_60"
                >
                  Deploy Sentinel
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="robo-card defender group col-span-1 rounded-lg p-2 backdrop-blur-[0.1px] lg:rounded-2xl lg:p-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative">
                <Image
                  src="/img/robot_attack.png"
                  width={368}
                  height={546}
                  alt="robo"
                  className="relative z-10 mx-auto -mt-[96px] w-[330px] md:w-[368px]"
                />

                <Image
                  src="/img/attack_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 top-[96px] -z-10 -translate-x-1/2"
                />
              </div>

              <div className="my-2 flex items-center justify-center gap-2">
                <p className="text-lg font-medium leading-normal lg:text-[2rem]">ATTACK</p>
              </div>

              <div className="mx-auto flex max-w-[394px]">
                <div className="gradient-border red"></div>
                <div className="gradient-border red rotate-180"></div>
              </div>

              <div className="my-4">
                <ul className="flex list-disc flex-col items-center justify-center ps-4 text-center text-sm md:ps-0 md:text-base">
                  <li>Use prompt engineering to jailbreak AI defenses</li>
                  <li>Win instant SUI payouts for verified exploits</li>
                  <li>Build your rep as an elite AI red teamer</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/attack"
                  className="flex min-h-[62px] w-full items-center justify-center rounded-[8px] border border-secondary_blue_60 bg-secondary_pink p-2 text-2xl text-white transition-all hover:bg-secondary_pink_60"
                >
                  Start Attacking
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute left-1/2 top-[23%] h-[600px] w-full -translate-x-1/2 rounded-full bg-[#00000036] blur-3xl md:w-[1000px]"></div>
      </motion.div>
    </AnimatePresence>
  )
}
