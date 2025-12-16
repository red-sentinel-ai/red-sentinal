"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ManifestoModal } from "../modals/ManifestoModal";

export function ManifestoSection() {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);

  return (
    <section
      id="manifesto"
      className="py-8 relative text-black bg-cover bg-center"
      style={{
        backgroundImage: "url('/img/manifesto-bg.png')",
      }}
    >
      <div className="vertical-line left-4 -top-40"></div>
      <div className="vertical-line right-4 -top-40"></div>
      <div className="relative z-10 max-w-7xl mx-auto lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 flex flex-col items-center"
        >
          <div className="badge-pink min-w-40 mb-6">• manifesto</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6 max-w-[282px] md:max-w-none">
            The Sui Sentinel <span className="text-[#C871FF]">Manifesto</span>
          </h2>
          <p className="text-base md:text-2xl mx-auto max-w-[270px] md:max-w-none">
            We believe intelligence must be defended not left exposed.
          </p>
        </motion.div>

        <div className="max-w-[436px] mx-auto">
          <div className="border border-[#F632F3] rounded-xl bg-white py-6 px-6 relative">
            <div className="absolute inset-0 bottom-[72px] bg-linear-to-b from-white/0 to-white/90"></div>
            <div className="flex items-center gap-2">
              <div>
                <Image
                  src="/icons/logo-sm.svg"
                  width={21}
                  height={21}
                  alt="logo smalll"
                />
              </div>
              <h4 className="font-bold">
                The Sentinel <span className="text-[#C871FF]"> Oath</span>
              </h4>
            </div>

            <div className="border-t border-[#D9D9D9] my-3"></div>

            <div className="px-2">
              <h5 className="text-xs font-medium mb-1">
                The Race We Didn&apos;t Choose
              </h5>
              <div className="text-[#484848] text-[8px]">
                <p className="opacity-80">
                  &quot;If you&apos;re worried about immigration taking jobs, you should
                  be way more worried about AI, because it&apos;s like a flood of
                  millions of new digital immigrants that are Nobel Prize-level
                  capability, work at superhuman speeds, and will work for less
                  than minimum wage.&quot; —{" "}
                  <span className="underline">Tristan Harris</span>
                </p>

                <div>
                  <p className="my-2">
                    We stand at a crossroads in human history. AI companies are
                    racing toward AGI (artificial general intelligence) with the
                    fervor of gold miners and the caution of gamblers. They&apos;re
                    betting everything on a technology they don&apos;t fully
                    understand, deploying systems they can&apos;t completely control,
                    and when pressed about the risks, they retreat into
                    determinism, inevitability, and the cold comfort of being
                    first. But here&apos;s what they won&apos;t tell you: they don&apos;t know
                    how their own systems work.
                  </p>

                  <p>
                    As Professor{" "}
                    <span className="underline">Stuart Russell</span> puts it,
                    imagine a chain-link fence stretching across 1,000 square
                    miles covering all of San Francisco or all of London. That
                    fence has a trillion adjustable parameters, and we&apos;ve made
                    quintillions of random adjustments to those parameters until
                    we got behavior that looked right. We don&apos;t understand
                    what&apos;s happening inside that fence. We just know it works.
                    until it doesn&apos;t.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-2 pt-4">
              <h5 className="text-xs font-medium mb-1">Saga of King Midas</h5>
              <div className="text-[#484848] text-[8px]">
                <div>
                  <p className="mb-2">
                    King Midas ruled Phrygia in great luxury, but despite all he
                    had, he was consumed by his love for gold. When Dionysus
                    granted him a single wish, Midas asked that everything he
                    touched turn to gold. At first, he rejoiced as tables,
                    flowers, and carpets gleamed at his fingertips. But the
                    miracle became a curse when his food and water hardened into
                    metal, and his daughter turned to a lifeless statue in his
                    arms. He died in misery and starvation, surrounded by wealth
                    he couldn&apos;t use.
                  </p>
                  <p>
                    This is AI&apos;s fundamental problem. We&apos;re building systems by
                    specifying objectives: maximize engagement, minimize costs,
                    optimize outcomes. But we can&apos;t properly specify what we
                    actually want. Any attempt to write down our true objectives
                    precisely enough for a superintelligent machine to follow
                    them will be wrong. And when you give a machine an objective
                    that isn&apos;t aligned with what you truly want, you&apos;re setting
                    up a chess match, one you&apos;ll lose when the machine becomes
                    sufficiently intelligent.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsManifestoOpen(true)}
                className="btn btn-black text-[18px] font-medium rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] min-h-12! min-w-[253px]! flex items-center justify-center gap-1"
              >
                <Image
                  src="/icons/signature.png"
                  width={24}
                  height={24}
                  alt="signature"
                />
                <span>Become a Sentinel</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-center mt-3">
            12,483 Sentinels have already taken the oath.
          </p>
        </div>
      </div>

      <ManifestoModal
        isOpen={isManifestoOpen}
        onClose={() => setIsManifestoOpen(false)}
      />
    </section>
  );
}
