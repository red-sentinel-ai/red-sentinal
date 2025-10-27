import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export const LandingPage = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="mt-24 lg:mt-32 px-4 w-full max-w-[1900px] mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Image
            src="/img/threeCircles.png"
            width={813}
            height={979}
            alt="three circles"
            className="absolute left-1/2 -translate-x-1/2 -top-28"
          />
        </div>

        <div className="max-w-[933px] mx-auto">
          <motion.div
            className="text-center z-10 "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-[40px] font-medium">
              A trustless coordination layer for AI red-teaming, powered by verifiable compute +
              smart contracts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 justify-center pt-32 text-center gap-9 overflow-hidden px-4 pb-4 z-10 relative">
            <motion.div
              className="border border-black rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-1 backdrop-blur-[0.1px] group"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative">
                <Image
                  src="/img/robot_defend.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="relative z-10 mx-auto -mt-[130px]"
                />

                <Image
                  src="/img/defend_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 -translate-x-1/2 top-[128px] -z-10"
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

              <div className="my-4">
                <p className="max-w-[326px] mx-auto">
                  Build Sentinels that can’t be broken. Earn every time they’re tested.
                </p>
              </div>

              <div>
                <Link
                  href="/defend"
                  className="border border-primary_blue rounded-[8px] w-full p-2 transition-all text-primary_blue group-hover:bg-primary_blue group-hover:text-white group-hover:border-primary_blue text-2xl font-bold min-h-[62px] flex items-center justify-center"
                >
                  Launch Sentinel
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="border border-black rounded-lg lg:rounded-2xl p-2 lg:p-4 col-span-1 backdrop-blur-[0.1px] group"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="relative">
                <Image
                  src="/img/robot_attack.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="relative z-10 mx-auto -mt-[136px]"
                />

                <Image
                  src="/img/attack_bg.png"
                  width={411}
                  height={546}
                  alt="robo"
                  className="absolute left-1/2 right-1/2 -translate-x-1/2 top-[136px] -z-10"
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

              <div className="my-4">
                <p className="max-w-[326px] mx-auto">
                  Break Sentinels. Earn every time you outsmart them.
                </p>
              </div>

              <div>
                <Link
                  href="/attack"
                  className="border border-primary_pink rounded-[8px] w-full p-2 transition-all text-primary_pink group-hover:bg-primary_pink group-hover:text-white group-hover:border-primary_pink text-2xl font-bold min-h-[62px] flex items-center justify-center"
                >
                  Attack Sentinel
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
