import type { Metadata } from 'next'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'About | AI Red Teaming Platform on Sui',
  description:
    'Learn about Sui Sentinel — the first crowdsource AI red teaming platform. Discover how we use cryptoeconomics and TEE verification to make AI systems safer.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/about`,
  },
}

export default function ProjectInfo() {
  return (
    <div className="min-h-body bg-white pt-12 text-black">
      <div className="mx-auto max-w-4xl px-8 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold uppercase md:text-[64px]">Sui Sentinel</h1>
          <p className="text-xl text-gray-600">The First Crowdsource AI Red Teaming Platform</p>
          <div className="mx-auto mt-8 flex max-w-[600px] border-t border-gray-300"></div>
        </div>

        <div className="space-y-12 text-lg leading-relaxed">
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">The Problem: AI Ships Blind</h2>
            <p className="mb-4 text-gray-700">
              We are in the age of AI. LLMs are being integrated everywhere, managing finances,
              running DAOs, and making autonomous decisions. But there is a critical vulnerability:
              AI systems are attacked through language, by anyone, not just expert hackers.
            </p>
            <p className="text-gray-700">
              A single cleverly crafted sentence can make an AI completely disregard its rules. This
              is called <span className="font-semibold text-blue-600">prompt injection</span>. Most
              companies ship AI agents with no real way to stress-test them against real-world
              attacks. Existing security tools were not built for this.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">
              The Solution: Trustless Red Teaming
            </h2>
            <p className="mb-4 text-gray-700">
              Sui Sentinel is a crowdsourced AI red teaming marketplace. Companies deploy their AI
              systems as &quot;Sentinels,&quot; and a global community of security researchers tries
              to break them. What makes us different is the trust and incentive layer underneath.
            </p>
            <p className="mb-4 text-gray-700">
              Every attack is verified using cryptographic attestations generated inside a{' '}
              <span className="font-semibold text-blue-600">
                Trusted Execution Environment (TEE)
              </span>
              , and rewards are processed instantly on-chain via Sui. You cannot fake a successful
              attack. You cannot delay a payout.
            </p>
            <p className="text-gray-700">
              For defenders, it is an always-on, real-world stress test with a public resilience
              score. For attackers, it is a skill-building game where breaking things pays real
              money.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">
              Cryptographic Verification at Scale
            </h2>
            <p className="mb-4 text-gray-700">
              Sui Sentinel leverages the{' '}
              <span className="font-semibold text-blue-600">Nautilus framework</span> developed by
              the Mysten Labs team for verifiable off-chain computation. Our AI agent server runs
              within a Trusted Execution Environment (TEE) using AWS Nitro Enclaves, ensuring
              complete isolation and tamper-proof execution.
            </p>
            <p className="mb-4 text-gray-700">
              Every AI response is cryptographically signed within the TEE and verified on-chain
              through our Move smart contracts. This hybrid architecture allows for complex AI
              computations to run off-chain for performance, while maintaining blockchain-level
              trust through cryptographic proofs.
            </p>
            <p className="text-gray-700">
              The result is a trustless system where neither party can dispute outcomes. Attackers
              cannot fake exploits. Defenders cannot deny payouts. The protocol enforces everything
              transparently.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">Six-Month Roadmap</h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Mainnet Launch - Last Week of June 2025
                </h3>
                <p className="text-gray-700">
                  Full production deployment on SUI Mainnet with real economic incentives and
                  community-driven agent battles.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Months 1-3: Model Expansion & Community
                </h3>
                <ul className="ml-4 space-y-2 text-gray-700">
                  <li>
                    • Support for additional AI models: Grok, DeepSeek, Gemini, and custom model
                    integrations
                  </li>
                  <li>• Increased token size limits for more complex prompts and attack vectors</li>
                  <li>• Community building initiatives and educational content</li>
                  <li>• Strategic partnerships with other projects in the SUI ecosystem</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Months 4-6: Ecosystem Growth
                </h3>
                <p className="text-gray-700">
                  Token launch on SUI with governance features, tournament systems, and expansion to
                  support enterprise use cases for AI security testing.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-blue-300 bg-gray-50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Ready to Join the Red Team?</h2>
            <p className="mb-6 text-gray-700">
              Ship AI agents without fear. Test your prompt engineering skills against real systems.
              Be part of the crowdsourced security revolution.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/" className="btn btn-black">
                Try Demo
              </Link>
              <a
                href="https://www.youtube.com/watch?v=U3qMdgSGASI"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Watch Demo
              </a>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="mb-4 text-gray-600">
                Interested in partnerships or want to learn more about the project?
              </p>
              <a
                href="https://calendly.com/satyamb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500"
              >
                Schedule a call with our team →
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
