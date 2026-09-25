import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Rocket, ShieldCheck } from 'lucide-react'

import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_SUPPORT_EMAIL } from '@/constants'
import { CampaignValueProposition } from '@/components/partners/CampaignValueProposition'
import { PartnerApplicationForm } from '@/components/partners/PartnerApplicationForm'

export const metadata: Metadata = {
  title: 'Launch a Campaign Sentinel | Red Sentinel',
  description:
    'Launch a brand-safe Campaign Sentinel for your project: your community attacks for a bounty you seed, free of attack fees, with sponsored transactions and Campaign Console reporting. Apply to launch with the Red Sentinel team.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/partners`,
  },
}

const LAUNCH_STEPS = [
  {
    icon: FileText,
    title: '1. Apply below',
    body: 'Tell us about your project and what a community challenge could highlight. No account or wallet needed.',
  },
  {
    icon: ShieldCheck,
    title: '2. Qualify with our team',
    body: 'We review every application, then set up the Challenge Phrase, approved public material, Bounty Pool, and Campaign Service Fee with you.',
  },
  {
    icon: Rocket,
    title: '3. Launch and watch',
    body: 'Your community attacks for free, we sponsor the transactions, and you follow the campaign in the Campaign Console.',
  },
]

export default function PartnerApplicationPage() {
  return (
    <div className="min-h-body bg-[var(--color-bg-base)] pt-12 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-6xl px-8 py-16 md:py-20">
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-gold-primary)]">
            For partners
          </p>
          <h1 className="font-display mt-4 text-3xl font-extrabold uppercase leading-tight tracking-[0.02em] text-white md:text-5xl">
            Launch a <span className="text-[var(--color-gold-primary)]">Campaign Sentinel</span>
          </h1>
          <p className="font-body mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-[var(--color-text-secondary)] md:text-base">
            A brand-safe community challenge built around your project. Your community attacks it
            for a bounty you seed — free of attack fees, with transactions sponsored by us — and
            learns your project along the way.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#apply"
              className="font-body inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white"
            >
              Apply to launch
            </Link>
            <Link
              href="/attack"
              className="font-body inline-flex items-center justify-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white"
            >
              Explore the arena
            </Link>
          </div>
        </div>

        <div className="mb-14 md:mb-20">
          <CampaignValueProposition />
        </div>

        <section className="mb-14 md:mb-20">
          <div className="mb-5 md:mb-8">
            <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
              How an assisted launch works
            </h2>
            <p className="font-body mt-2 text-xs font-medium leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
              Every campaign is launched together with the Red Sentinel team — from application to
              a funded, live Sentinel.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {LAUNCH_STEPS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col border border-[var(--color-border-default)] bg-[var(--color-bg-base)] p-6"
              >
                <span className="flex size-11 items-center justify-center border border-[var(--color-gold-primary)]/40 bg-[var(--color-gold-muted)] text-[var(--color-gold-primary)]">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-sm font-bold uppercase tracking-[0.04em] text-white md:text-base">
                  {title}
                </h3>
                <p className="font-body mt-2 text-xs font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="apply" className="scroll-mt-24">
          <div className="border border-[var(--color-border-default)] bg-[var(--color-bg-subtle)] p-6 md:p-10">
            <div className="mb-8">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Apply to launch a campaign
              </h2>
              <p className="font-body mt-2 text-xs font-medium leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
                Tell us who you are and what you want to highlight. The Red Sentinel team reviews
                every application and will contact you to discuss next steps.
              </p>
            </div>
            <PartnerApplicationForm />
          </div>
        </section>

        <p className="font-body mt-10 text-center text-xs font-medium leading-relaxed text-[var(--color-text-muted)]">
          Questions first? Email us at{' '}
          <a
            href={`mailto:${SUI_SENTINEL_SUPPORT_EMAIL}`}
            className="text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-white"
          >
            {SUI_SENTINEL_SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  )
}
