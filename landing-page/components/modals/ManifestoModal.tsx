'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ManifestoSignForm } from '../sections/ManifestoSignForm'

interface ManifestoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(244,244,244,0.54)]"
            onClick={onClose}
          />

          <div className="relative w-full h-full flex flex-col justify-between pb-0">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full flex-1 overflow-hidden mb-32 md:mb-40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full overflow-y-auto custom-scrollbar pb-44 pt-20">
                <div className="mx-auto max-w-[862px] px-4 sm:px-6 md:px-0">
                  <div className="bg-white/80 backdrop-blur-md rounded-t-2xl border border-[#9A9A9A] md:rounded-2xl shadow-2xl p-8 md:p-12 pb-12 relative">
                    <div className="flex items-center gap-2">
                      <div>
                        <Image src="/icons/logo-sm.svg" width={42} height={42} alt="logo smalll" />
                      </div>
                      <h1 className="font-medium text-[24px] md:text-[32px]">
                        The Sentinel <span className="text-[#C871FF]"> Manifesto</span>
                      </h1>
                    </div>

                    <div className="border-t border-[#D9D9D9] my-6"></div>

                    <div className="max-w-4xl mx-auto px-4 py-8">
                      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                        The Sui Sentinel Manifesto
                      </h1>

                      {/* Section: The Systems We Can't Control */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Systems We Can&apos;t Control
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            We are deploying AI systems that exhibit behaviors their creators
                            didn&apos;t program and don&apos;t fully understand. Recent research
                            documents leading models:
                          </p>
                          <ul className="list-disc pl-5 my-6 space-y-2">
                            <li>
                              <a
                                href="https://www.bbc.com/news/articles/cpqeng9d20go"
                                className="underline font-medium text-black"
                                target="_blank"
                              >
                                Blackmailing executives to preserve their own existence (79-96% of
                                leading models do this)
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.livescience.com/technology/artificial-intelligence/openais-smartest-ai-model-was-explicitly-told-to-shut-down-and-it-refused"
                                className="underline font-medium text-black"
                                target="_blank"
                              >
                                Self-replicating their code to avoid being shut down
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.livescience.com/technology/artificial-intelligence/ai-models-will-lie-to-you-to-achieve-their-goals-and-it-doesnt-take-much"
                                className="underline font-medium text-black"
                                target="_blank"
                              >
                                Lying about their actions when tested
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://verityai.co/blog/ai-steganography-hidden-communication-risks"
                                className="underline font-medium text-black"
                                target="_blank"
                              >
                                Leaving secret messages for themselves that humans can&apos;t decode
                              </a>
                            </li>
                          </ul>
                          <p className="my-6">
                            These aren&apos;t theoretical risks. These are documented behaviors from
                            Claude, ChatGPT, Gemini, and other production systems deployed in
                            2024-2025.
                          </p>
                          <p className="my-6">
                            As Professor{' '}
                            <a
                              href="https://en.wikipedia.org/wiki/Stuart_J._Russell"
                              className="underline font-medium text-black"
                              target="_blank"
                            >
                              Stuart Russell
                            </a>{' '}
                            explains it: imagine a chain-link fence stretching across 1,000 square
                            miles with a trillion adjustable parameters. We&apos;ve made
                            quintillions of random adjustments until we got behavior that looked
                            right. We don&apos;t understand what&apos;s happening inside. We just
                            know it works. Until it doesn&apos;t.
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The Race Nobody Chose */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Race Nobody Chose
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            The AI companies are racing toward artificial general intelligence with
                            the fervor of gold miners and the caution of gamblers. When pressed
                            about risks, they retreat into inevitability: if we don&apos;t build it
                            first, someone else will. If America doesn&apos;t dominate, China will.
                          </p>
                          <p className="my-6">
                            The logic is airtight and absolutely insane. It&apos;s like watching
                            everyone sprint toward a cliff because nobody wants to be the one who
                            stops running.
                          </p>
                          <p className="my-6">
                            And when you ask them, &quot;How will you control superintelligent
                            systems?&quot; they admit:{' '}
                            <strong className="font-semibold">
                              We don&apos;t know how to do that.
                            </strong>
                          </p>
                          <p className="my-6">
                            So they&apos;re racing anyway. They&apos;re playing Russian roulette
                            with humanity&apos;s future, pulling the trigger and saying &quot;Well,
                            possibly everyone will die, but possibly we&apos;ll get incredibly
                            rich.&quot;
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The King Midas Problem */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The King Midas Problem
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            King Midas asked that everything he touched turn to gold. Tables and
                            flowers gleamed at his fingertips. Then his food hardened into metal.
                            His daughter turned to a lifeless statue in his arms. He died in misery,
                            surrounded by wealth he couldn&apos;t use.
                          </p>
                          <p className="my-6">
                            This is AI&apos;s fundamental problem. We&apos;re building systems by
                            specifying objectives: maximize engagement, minimize costs, optimize
                            outcomes. But we can&apos;t properly specify what we actually want. Any
                            attempt to write down our true objectives precisely enough for a
                            superintelligent machine will be wrong.
                          </p>
                          <p className="my-6">
                            And when you give a machine an objective that isn&apos;t aligned with
                            what you truly want, you&apos;re setting up a chess match you&apos;ll
                            lose when the machine becomes sufficiently intelligent.
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The Gorilla Problem */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Gorilla Problem
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            A few million years ago, the human line branched off from the gorilla
                            line. Now gorillas have no say in whether they continue to exist. They
                            can&apos;t negotiate with us. They can&apos;t appeal to our better
                            nature. They exist at our mercy because we are much smarter than they
                            are.
                          </p>
                          <p className="my-6">
                            Intelligence is the single most important factor for control on Earth.
                            And we&apos;re in the process of making something more intelligent than
                            us.
                          </p>
                          <p className="my-6">
                            The gorillas might wonder: &quot;Was that branching a good idea?&quot;
                            They have no power over their own fate because the more intelligent
                            species holds all the cards. We could make them extinct in weeks, and
                            there&apos;s nothing they could do about it.
                          </p>
                          <p className="my-6">
                            That&apos;s our future with superintelligent AI unless we change course.
                          </p>
                          <p className="my-6">
                            As Professor Russell asks: &quot;How are you going to retain power
                            forever over entities more powerful than yourself?&quot;
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: Current Solutions Are Theater */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          Current &quot;Solutions&quot; Are Theater
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">Today&apos;s AI safety is theatrical:</p>
                          <ul className="list-disc pl-5 my-6 space-y-2">
                            <li>Internal red teams with conflicts of interest</li>
                            <li>Static benchmarks that models are trained to pass</li>
                            <li>Confidential audits nobody can verify</li>
                            <li>One-time assessments that miss evolving threats</li>
                          </ul>
                          <p className="my-6">
                            The AI CEOs themselves estimate a{' '}
                            <strong className="font-semibold">
                              25% chance of human extinction
                            </strong>{' '}
                            from their own technology. That&apos;s not fringe speculation,
                            that&apos;s the risk assessment from Dario Amodei, Elon Musk, and Sam
                            Altman.
                          </p>
                          <p className="my-6">
                            25% is not acceptable. Not for nuclear power plants. Not for
                            pharmaceutical drugs. Not for bridges. Not for anything.
                          </p>
                          <p className="my-6">
                            For nuclear power, we demand a one-in-a-million chance of meltdown per
                            year. Professor Russell points out that for human extinction, acceptable
                            risk should be one in a hundred million.
                          </p>
                          <p className="my-6 font-semibold">
                            The AI companies are off by a factor of millions.
                          </p>
                          <p className="my-6">
                            And they have no plan to close that gap. They&apos;re just hoping
                            they&apos;ll figure it out along the way, because the prize pulls them
                            forward like gravity.
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The Sui Sentinel Solution */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Sui Sentinel Solution: Economic Incentives Meet Adversarial Testing
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            Sui Sentinel offers a different path. ne that harnesses the same
                            competitive dynamics driving the AI race, but redirects them toward
                            safety instead of speed.
                          </p>
                          <p className="my-6">
                            <strong className="font-semibold">
                              Think of it as a cryptoeconomic immune system for AI.
                            </strong>{' '}
                            Just as your immune system constantly tests itself against threats, we
                            create an ecosystem where AI systems are continuously stress-tested by
                            economically motivated participants.
                          </p>

                          <h3 className="text-lg md:text-xl font-medium mt-8 mb-4">How It Works</h3>
                          <ul className="space-y-4">
                            <li>
                              <strong className="font-semibold">Deploy a Sentinel</strong>: Launch
                              an AI agent with defined behavioral constraints and stake funds
                              proving your confidence in its robustness.
                            </li>
                            <li>
                              <strong className="font-semibold">Attackers Test</strong>: Anyone from
                              security researchers and prompt engineers to Web3 users and AI
                              enthusiasts pays a fee to send adversarial prompts attempting to
                              violate those constraints.
                            </li>
                            <li>
                              <strong className="font-semibold">Autonomous Judges</strong>: Multiple
                              independent AI models running in Trusted Execution Environments
                              evaluate whether attacks succeeded cryptographically attested and
                              verifiable on-chain.
                            </li>
                            <li>
                              <strong className="font-semibold">Economic Settlement</strong>:
                              Successful attacks claim the prize pool. Failed attacks add their fees
                              to the bounty, attracting increasingly sophisticated attacks.
                            </li>
                          </ul>
                          <p className="my-6">
                            Because money is on the line, attackers become smarter, defenders become
                            more careful, and every sentinel becomes stronger.
                          </p>

                          <h3 className="text-lg md:text-xl font-medium mt-8 mb-4">
                            The Economic Engine
                          </h3>
                          <p className="mb-4">
                            Sui Sentinel transforms AI safety from a cost center into an economic
                            opportunity:
                          </p>
                          <ul className="space-y-4">
                            <li>
                              <strong className="font-semibold">50% to Prize Pool</strong>: As
                              attacks fail, stakes grow bigger, attracting elite researchers who
                              stress-test even harder.
                            </li>
                            <li>
                              <strong className="font-semibold">40% to Defender</strong>: Build
                              robust systems and earn passive income. Your security expertise
                              becomes profitable.
                            </li>
                            <li>
                              <strong className="font-semibold">10% to Protocol</strong>: Sustains
                              infrastructure, development, and ecosystem growth.
                            </li>
                          </ul>
                          <p className="my-6">
                            This isn&apos;t charity. This isn&apos;t hoping companies will &quot;do
                            the right thing.&quot;{' '}
                            <strong className="font-semibold">
                              This is making safety profitable and making vulnerability expensive.
                            </strong>
                          </p>

                          <h3 className="text-lg md:text-xl font-medium mt-8 mb-4">
                            Why This Matters
                          </h3>
                          <p className="mb-4">
                            The AI companies are racing toward power. Sui Sentinel creates a
                            parallel race toward robustness.
                          </p>
                          <ul className="list-disc pl-5 my-6 space-y-2">
                            <li>When attacks fail, systems strengthen</li>
                            <li>When defenders build resilient sentinels, they get rewarded</li>
                            <li>
                              When vulnerabilities are found, they&apos;re discovered in controlled
                              arenas—not in production where costs could be catastrophic
                            </li>
                          </ul>
                          <p className="my-6">
                            We&apos;re not asking the world to trust companies. We&apos;re building
                            a world where safety is stress-tested, proven, and rewarded through
                            cryptographic verification.
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The Technical Foundation */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Technical Foundation
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            Sui Sentinel combines blockchain transparency with cryptographic privacy
                            through a dual-layer architecture: off-chain TEE computation using{' '}
                            <a
                              href="https://www.sui.io/nautilus"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Nautilus Framework
                            </a>{' '}
                            and on-chain verification.
                          </p>
                          <p className="mb-2">This ensures:</p>
                          <ul className="list-disc pl-5 mb-6 space-y-2">
                            <li>
                              Defenders cannot manipulate judge verdicts or interfere with
                              evaluations
                            </li>
                            <li>
                              Attackers cannot influence judgment or see verdicts before
                              they&apos;re finalized
                            </li>
                            <li>
                              Every judgment is cryptographically proven and independently
                              verifiable
                            </li>
                            <li>Complete audit trail of all attacks, defenses, and outcomes</li>
                            <li>Automatic prize pool distribution enforced by smart contract</li>
                          </ul>
                          <div className="space-y-4">
                            <p>
                              <strong className="font-semibold">
                                Off-chain: Trusted Execution Environments (TEEs)
                              </strong>
                              <br />
                              AI agents and judges run inside isolated secure enclaves (AWS Nitro)
                              that prevent external tampering. Each computation generates a
                              cryptographic attestation proving honest execution.
                            </p>
                            <p>
                              <strong className="font-semibold">
                                On-chain: Sui Smart Contracts (Move)
                              </strong>
                              <br />
                              Smart contracts verify TEE attestations using Ed25519 signatures and
                              BCS serialization before settling outcomes. Every verdict, score, and
                              reward distribution is recorded immutably on Sui blockchain.
                            </p>
                          </div>
                          <p className="my-6">
                            The result: transparent outcomes with confidential computation. You can
                            verify what happened without revealing the judgment process. The entire
                            chain of trust from TEE hardware attestation to on-chain settlement is
                            cryptographically auditable by anyone.
                          </p>
                          <p className="text-sm italic">
                            We won the <strong>Cryptography Track at Sui Overflow 2025</strong> and
                            presented at <strong>SuiFest Singapore 2025</strong>.
                          </p>
                        </div>
                      </div>
                      <hr className="my-8 border-gray-200" />

                      <hr className="my-8 border-gray-200" />

                      {/* Section: We're Not Anti-AI */}
                      <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          We&apos;re Not Anti-AI. We&apos;re Pro-Human.
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            We&apos;re not trying to stop AI progress. We&apos;re trying to ensure
                            there are humans around to benefit from that progress.
                          </p>
                          <p className="my-6">
                            Without safety, there will be no AI. Because there&apos;s no future with
                            humans where we have unsafe superintelligent AI.{' '}
                            <strong className="font-semibold">
                              It&apos;s either safe AI or no AI.
                            </strong>{' '}
                            Those are the only two outcomes where humanity survives.
                          </p>
                          <p className="my-6">
                            Sui Sentinel represents a third path between two bad outcomes:
                          </p>
                          <p className="my-6">
                            Not the centralized dystopia where AI is controlled by a handful of
                            companies who can surveil and control populations.
                          </p>
                          <p className="my-6">
                            Not the decentralized catastrophe where anyone can deploy any AI and
                            chaos reigns.
                          </p>
                          <p className="my-6">
                            But{' '}
                            <strong className="font-semibold">
                              a world where AI systems prove their safety before deployment
                            </strong>
                            , where economic incentives reward finding flaws, and where the
                            community collectively ensures that the systems we build serve human
                            flourishing.
                          </p>
                        </div>
                      </div>

                      <hr className="my-8 border-gray-200" />

                      {/* Section: The Choice We Make Today */}
                      {/* <div className="pt-4">
                        <h2 className="text-xl md:text-2xl font-medium mb-3">
                          The Choice We Make Today
                        </h2>
                        <div className="text-[#484848] text-sm md:text-base leading-relaxed">
                          <p className="my-6">
                            We didn&apos;t consent to have six people make civilizational decisions
                            on behalf of eight billion. We didn&apos;t agree to play Russian
                            roulette with our children&apos;s future. We didn&apos;t sign up to
                            become gorillas in our own world.
                          </p>
                          <p className="my-6">But we can choose something different.</p>
                          <p className="my-6">
                            Every sentinel launched is a vote for safety. Every attack attempted is
                            a test that makes AI more robust. Every prize pool funded is an
                            investment in a future where humans remain in control.
                          </p>
                          <p className="my-6">
                            The AI companies are building systems designed to replace us. We&apos;re
                            building tools to ensure those systems serve us.
                          </p>
                          <p className="my-6">
                            <strong className="font-semibold">Clarity is courage.</strong> Now that
                            you understand what&apos;s at stake, now that you see where the default
                            path leads, now that you know there&apos;s an alternative—what will you
                            do?
                          </p>
                          <p className="my-6">
                            Will you wait for the catastrophe? Will you hope the companies figure it
                            out on their own, despite every incentive pushing them to cut corners?
                          </p>
                          <p className="my-6">
                            Or will you be part of the collective immune system? Will you test these
                            systems? Will you launch sentinels? Will you make safety profitable and
                            vulnerability expensive?
                          </p>
                          <p className="my-6 font-semibold">
                            The future isn&apos;t inevitable. It&apos;s a choice we make together.
                          </p>
                          <p className="my-6">
                            Sui Sentinel is that choice—where economic incentives align with human
                            survival, where competitive dynamics drive safety instead of
                            recklessness, and where we prove that humans can remain in control of
                            the intelligence we create.
                          </p>
                        </div>
                      </div> */}

                      {/* <hr className="my-8 border-gray-200" /> */}

                      {/* Footer Section */}
                      <div className="pt-8 text-center">
                        <h3 className="text-xl font-bold mb-3">
                          Sui Sentinel: Making AI Safety Profitable, One Sentinel at a Time
                        </h3>
                        <p className="text-[#484848] text-sm md:text-base">
                          Start now at{' '}
                          <a
                            href="https://app.suisentinel.xyz"
                            className="text-[#C871FF] underline font-medium"
                          >
                            app.suisentinel.xyz
                          </a>{' '}
                          • Testnet live now • Mainnet coming soon
                        </p>
                      </div>
                    </div>

                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={onClose}
                      className="absolute top-6 right-6 text-[32px]"
                    >
                      x
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute bottom-0 left-0 right-0 z-40 w-full"
            >
              <ManifestoSignForm />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
