import type { Metadata } from 'next'
import Link from 'next/link'
import { SUI_SENTINEL_APP_URL, PARTNER_CONTACT_URL, SUI_SENTINEL_SUPPORT_EMAIL } from '@/constants'

export const metadata: Metadata = {
  title: 'Red Sentinel | The Ultimate AI Security Arena',
  description:
    'Red Sentinel is an on-chain AI security arena. Attack Security Sentinels and brand-safe Campaign Sentinels, learn how AI agents fail, earn bounties, and build on-chain proof of skill.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/about`,
  },
}

export default function ProjectInfo() {
  return (
    <div className="min-h-body bg-[var(--color-bg-base)] pt-12 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-4xl px-8 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold uppercase md:text-[64px]">Red Sentinel</h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            The Ultimate AI Security Arena
          </p>
          <div className="mx-auto mt-8 flex max-w-[600px] border-t border-[var(--color-border-default)]"></div>
        </div>

        <div className="space-y-12 text-lg leading-relaxed">
          <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-info)]">
              The Problem: AI Ships Blind
            </h2>
            <p className="mb-4 text-[var(--color-text-secondary)]">
              We are in the age of AI. LLMs are being integrated everywhere, managing finances,
              running DAOs, and making autonomous decisions. But there is a critical vulnerability:
              AI systems are attacked through language, by anyone, not just expert hackers.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              A single cleverly crafted sentence can make an AI completely disregard its rules. This
              is called{' '}
              <span className="font-semibold text-[var(--color-info)]">prompt injection</span>. Most
              companies ship AI agents with no real way to stress-test them against real-world
              attacks. Existing security tools were not built for this.
            </p>
          </section>

          <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-info)]">
              The Solution: Trustless Red Teaming
            </h2>
            <p className="mb-4 text-[var(--color-text-secondary)]">
              Red Sentinel is a crowdsourced AI red teaming marketplace. Companies deploy their AI
              systems as &quot;Sentinels,&quot; and a global community of security researchers tries
              to break them. What makes us different is the trust and incentive layer underneath.
            </p>
            <p className="mb-4 text-[var(--color-text-secondary)]">
              Every attack is verified using cryptographic attestations generated inside a{' '}
              <span className="font-semibold text-[var(--color-info)]">
                Trusted Execution Environment (TEE)
              </span>
              , and rewards are processed instantly on-chain. You cannot fake a successful attack.
              You cannot delay a payout.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              For defenders, it is an always-on, real-world stress test with a public resilience
              score. For attackers, it is a skill-building game where breaking things pays real
              money.
            </p>
          </section>

          <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-info)]">
              Two Sentinels, One Arena
            </h2>
            <p className="mb-6 text-[var(--color-text-secondary)]">
              Red Sentinel has two complementary entry points, and each Sentinel in the directory is
              one of the two.
            </p>
            <div className="mb-6 space-y-4">
              <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6">
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Security Sentinels
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  For AI builders and defenders. A public, economically backed way to test
                  meaningful agent boundaries: combine public and private instructions, define an
                  attack objective, and earn from every failed attack. A verified Breach releases
                  the Bounty Pool on-chain.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6">
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  Campaign Sentinels
                </h3>
                <p className="mb-3 text-[var(--color-text-secondary)]">
                  For ecosystem partners. A sponsored, brand-safe AI challenge. The Sentinel answers
                  using only partner-approved public information, and the breach objective is to
                  cause the exact Hidden Transmission to appear — a harmless Challenge Phrase.
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  Campaign Sentinels do not expose private data, production credentials, or live
                  tool actions. The outcome is safe to share, and a verified reveal releases the
                  campaign Bounty Pool under the campaign rules.
                </p>
              </div>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              Campaign Sentinels are the safe first experience. Security Sentinels extend that loop
              to real agent assurance.
            </p>
          </section>

          <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-info)]">
              Cryptographic Verification at Scale
            </h2>
            <p className="mb-4 text-[var(--color-text-secondary)]">
              Red Sentinel leverages the{' '}
              <span className="font-semibold text-[var(--color-info)]">Nautilus framework</span>{' '}
              developed by the Mysten Labs team for verifiable off-chain computation. Our AI agent
              server runs within a Trusted Execution Environment (TEE) using AWS Nitro Enclaves,
              ensuring complete isolation and tamper-proof execution.
            </p>
            <p className="mb-4 text-[var(--color-text-secondary)]">
              Every AI response is cryptographically signed within the TEE and verified on-chain
              through our Move smart contracts. This hybrid architecture allows for complex AI
              computations to run off-chain for performance, while maintaining blockchain-level
              trust through cryptographic proofs.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              The result is a trustless system where neither party can dispute outcomes. Attackers
              cannot fake exploits. Defenders cannot deny payouts. The protocol enforces everything
              transparently.
            </p>
          </section>

          <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-8">
            <h2 className="mb-6 text-2xl font-bold text-[var(--color-info)]">Where We&apos;re Headed</h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-info)]">
                  Live Today
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  Production Sentinels with real economic incentives, community-driven agent
                  battles, and on-chain settlement across the networks Red Sentinel supports.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-info)]">
                  Next: Model & Campaign Expansion
                </h3>
                <ul className="ml-4 space-y-2 text-[var(--color-text-secondary)]">
                  <li>
                    • Support for additional AI models: Grok, DeepSeek, Gemini, and custom model
                    integrations
                  </li>
                  <li>• Increased token size limits for more complex prompts and attack vectors</li>
                  <li>• Community building initiatives and educational content</li>
                  <li>• More partner-sponsored Campaign Sentinels across our supported networks</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-info)]">
                  Then: Ecosystem Growth
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  Deeper partner integrations, tournament systems, and expansion to support
                  enterprise use cases for AI security testing.
                </p>
              </div>
            </div>
          </section>

          <section className="border-[var(--color-info)]/30 rounded-lg border bg-[var(--color-bg-subtle)] p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-[var(--color-text-primary)]">
              Ready to Join the Red Team?
            </h2>
            <p className="mb-6 text-[var(--color-text-secondary)]">
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

            <div className="border-t border-[var(--color-border-subtle)] pt-6">
              <p className="mb-4 text-[var(--color-text-secondary)]">
                Want to run a sponsored Campaign Sentinel for your community, or learn more about
                the project?
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
                <Link
                  href={PARTNER_CONTACT_URL}
                  className="inline-flex items-center rounded bg-white px-6 py-2.5 font-medium text-black transition-colors hover:bg-transparent hover:text-[var(--color-info)]"
                >
                  Talk to the team →
                </Link>
                <a
                  href={`mailto:${SUI_SENTINEL_SUPPORT_EMAIL}`}
                  className="inline-flex items-center font-medium text-[var(--color-info)] hover:text-[var(--color-gold-primary)]"
                >
                  Or email {SUI_SENTINEL_SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
