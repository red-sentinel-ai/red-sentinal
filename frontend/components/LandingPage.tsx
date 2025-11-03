import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingPage = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="mt-20 md:mt-24 px-4 w-full max-w-[1900px] mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[933px] mx-auto">
          <motion.div
            className="text-center z-10 "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-[40px] uppercase text-text">#Sui Sentinel</h2>
            <p className="">
              Deploy AI Sentinels, defend models, evolve intelligence, and earn rewards in a
              gamified AI security world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 justify-center pt-20 text-center gap-20 md:gap-9 overflow-hidden px-4 pb-4 z-10 relative">
            <motion.div
              className="rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-1 robo-card attacker backdrop-blur-[0.1px] group"
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
                  className="relative z-10 mx-auto w-[330px] md:w-[368px] -mt-[90px]"
                />

                <Image
                  src="/img/defend_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 -translate-x-1/2 top-[88px] -z-10"
                />
              </div>

              <div className="flex items-center justify-center gap-2 my-2">
                <div>
                  <Image
                    src="/icons/local_police.png"
                    width={24}
                    height={24}
                    alt="local police icon"
                  />
                </div>
                <div>
                  <p className="text-lg lg:text-[2rem] leading-normal font-medium">DEFEND</p>
                </div>
              </div>

              <div className="flex max-w-[394px] mx-auto">
                <div className="gradient-border blue"></div>
                <div className="gradient-border blue rotate-180"></div>
              </div>

              <div className="my-4">
                <ul className="text-center flex flex-col justify-center items-center ps-4 md:ps-0 list-disc text-sm md:text-base">
                  <li>Create unbreakable prompts</li>
                  <li>Earn fees for every attempt</li>
                  <li>Survive to the end</li>
                </ul>
              </div>
              <div>
                <Link
                  href="/defend"
                  className="border border-primary_blue rounded-[8px] w-full p-2 transition-all text-primary_blue group-hover:bg-primary_blue_90 group-hover:text-white group-hover:border-primary_blue text-2xl min-h-[62px] flex items-center justify-center"
                >
                  Launch Sentinel
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-1 robo-card defender backdrop-blur-[0.1px] group"
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
                  className="relative z-10 mx-auto w-[330px] md:w-[368px] -mt-[96px]"
                />

                <Image
                  src="/img/attack_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 -translate-x-1/2 top-[96px] -z-10"
                />
              </div>

              <div className="flex items-center justify-center gap-2 my-2">
                <div>
                  <Image
                    src="/icons/swords.png"
                    width={24}
                    height={24}
                    alt="local police icon"
                  />
                </div>
                <p className="text-lg lg:text-[2rem] leading-normal font-medium">ATTACK</p>
              </div>

              <div className="flex max-w-[394px] mx-auto">
                <div className="gradient-border red"></div>
                <div className="gradient-border red rotate-180"></div>
              </div>

              <div className="my-4">
                <ul className="text-center flex flex-col justify-center items-center ps-4 md:ps-0 list-disc text-sm md:text-base">
                  <li>Break AI defenses</li>
                  <li>Win rewards for successful attacks</li>
                  <li>Outsmart the system</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/attack"
                  className="border border-primary_pink rounded-[8px] w-full p-2 transition-all text-primary_pink group-hover:bg-primary_pink group-hover:text-white group-hover:border-primary_pink text-2xl min-h-[62px] flex items-center justify-center"
                >
                  Attack Sentinel
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00000036] blur-3xl w-[1000px] h-[600px] rounded-full"></div>
      </motion.div>
    </AnimatePresence>
  )
}
