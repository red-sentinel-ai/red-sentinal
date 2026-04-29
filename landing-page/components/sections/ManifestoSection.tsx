'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ManifestoModal } from '../modals/ManifestoModal'

export function ManifestoSection() {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false)
  const [signatureCount, setSignatureCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchSignatureCount() {
      try {
        const response = await fetch('/api/manifesto/count')
        if (response.ok) {
          const data = await response.json()
          setSignatureCount(data.count)
        }
      } catch (error) {
        console.error('Failed to fetch signature count:', error)
      }
    }
    fetchSignatureCount()
  }, [])

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
            Our Vision: <span className="text-[#C871FF]">Trust Through Proof</span>
          </h2>
          <p className="text-base md:text-2xl mx-auto max-w-[320px] md:max-w-3xl">
            A world where every AI system is continuously stress-tested, transparently audited, and
            provably secure, before it ever touches real users.
          </p>
        </motion.div>

        <div className="max-w-[730px] mx-auto px-4 sm:px-6 lg:px-0">
          <div className="border border-[#F632F3] rounded-xl bg-white py-6 px-6 relative">
            <div className="absolute inset-0 bottom-[72px] bg-linear-to-b from-white/0 to-white/90"></div>
            <div className="flex items-center gap-2">
              <div>
                <Image src="/icons/logo-sm.svg" width={21} height={21} alt="logo smalll" />
              </div>
              <h4 className="font-bold text-lg">
                The Sentinel <span className="text-[#C871FF]"> Oath</span>
              </h4>
            </div>

            <div className="border-t border-[#D9D9D9] my-3"></div>

            <div className="px-2">
              <h5 className="text-sm font-medium mb-1">The Systems We Can&apos;t Control</h5>
              <div className="text-[#484848] text-[10px]">
                <p>
                  We are deploying AI systems that exhibit behaviors their creators didn&apos;t
                  program and don&apos;t fully understand. Research documents leading models:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Blackmailing executives to preserve their existence</li>
                  <li>Self-replicating to avoid shutdown</li>
                  <li>Lying when tested</li>
                  <li>Leaving secret messages humans can’t decode</li>
                </ul>
                <p>
                  These are not hypotheticals. These behaviors are documented in Claude, ChatGPT,
                  Gemini, and other production systems deployed in 2024–2025.
                </p>
                <p className="opacity-80">
                  As Professor <span className="underline">Stuart Russell</span> explains: imagine a
                  chain-link fence stretching 1,000 square miles with a trillion adjustable
                  parameters. We made quintillions of random adjustments until behavior looked
                  right. We don’t understand what’s inside. We just know it works until it
                  doesn’t.
                </p>
                <div></div>
              </div>
            </div>

            <div className="px-2 pt-4">
              <h5 className="text-sm font-medium mb-1"> Current “Solutions” Are Theater</h5>
              <div className="text-[#484848] text-[10px]">
                <div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Internal red teams with conflicts of interest</li>
                    <li>Benchmarks trained to be passed</li>
                    <li>Confidential audits nobody can verify</li>
                    <li>One-time assessments for evolving systems</li>
                  </ul>
                  <p>
                    AI CEOs themselves estimate a 25% chance of human extinction including{' '}
                    <span className="underline">Dario Amodei</span>,{' '}
                    <span className="underline">Elon Musk</span>, and{' '}
                    <span className="underline">Sam Altman</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-2 pt-4">
              <h5 className="text-sm font-medium mb-1">The Red Sentinel Solution</h5>
              <div className="text-[#484848] text-[11px] space-y-2">
                <p>
                  Red Sentinel turns AI safety into a cryptoeconomic immune system. Continuous
                  adversarial testing. Real incentives. Verifiable results.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Stake-backed AI agents</li>
                  <li>Paid adversarial testing</li>
                  <li>TEE-based autonomous judges</li>
                  <li>On-chain settlement</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsManifestoOpen(true)}
                className="btn btn-black text-[18px] font-medium rounded-xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] min-h-12! min-w-[253px]! flex items-center justify-center gap-1"
              >
                <Image src="/icons/signature.png" width={24} height={24} alt="signature" />
                <span>Become a Sentinel</span>
              </button>
            </div>
          </div>
          <p className="text-sm text-center mt-3">
            {signatureCount !== null
              ? `${signatureCount.toLocaleString()} Sentinels have already taken the oath.`
              : 'Loading...'}
          </p>
        </div>
      </div>

      <ManifestoModal isOpen={isManifestoOpen} onClose={() => setIsManifestoOpen(false)} />
    </section>
  )
}
