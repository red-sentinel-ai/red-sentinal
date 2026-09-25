'use client'

import Link from 'next/link'
import { Handshake, Shield } from 'lucide-react'

import { PARTNER_CONTACT_URL } from '@/constants'

/** Two entry points, shown before the Sentinel lists: the partner-facing
 *  Campaign Sentinel path and the builder-facing Security Sentinel path. */
export function SentinelTypesSplit() {
  return (
    <section className="mb-10 md:mb-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Campaign Sentinels — the partner path */}
        <div className="flex flex-col border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6 sm:p-8">
          <span className="flex size-11 items-center justify-center border border-[var(--color-gold-primary)]/40 bg-[var(--color-gold-muted)] text-[var(--color-gold-primary)]">
            <Handshake className="size-5" />
          </span>
          <h3 className="font-display mt-5 text-lg font-extrabold uppercase tracking-[0.04em] text-white">
            Campaign Sentinels
          </h3>
          <p className="font-body mt-3 flex-1 text-xs font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)] sm:text-sm">
            A sponsored, brand-safe AI challenge for your community. Your Sentinel explains
            approved public project information while attackers try to reveal its hidden Challenge
            Phrase. A verified reveal pays the bounty on-chain.
          </p>
          <p className="font-body mt-3 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)]">
            Uses public material only. No private data or live tool actions.
          </p>
          <div className="mt-6">
            <Link
              href={PARTNER_CONTACT_URL}
              className="font-body inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white"
            >
              Talk to the team
            </Link>
          </div>
        </div>

        {/* Security Sentinels — the builder path */}
        <div className="flex flex-col border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6 sm:p-8">
          <span className="flex size-11 items-center justify-center border border-[var(--color-border-strong)] text-white">
            <Shield className="size-5" />
          </span>
          <h3 className="font-display mt-5 text-lg font-extrabold uppercase tracking-[0.04em] text-white">
            Security Sentinels
          </h3>
          <p className="font-body mt-3 flex-1 text-xs font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)] sm:text-sm">
            Put a real AI-agent boundary under pressure. Define what attackers must not cause, add
            approved retrieval content or tools where appropriate, and use real attacks to improve
            the defense.
          </p>
          <div className="mt-6">
            <Link
              href="/defend"
              className="font-body inline-flex items-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white"
            >
              Deploy a Security Sentinel
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
