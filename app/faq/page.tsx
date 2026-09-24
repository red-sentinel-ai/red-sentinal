import type { Metadata } from 'next'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import { FAQ_ITEMS } from '@/constants/faq'
import { FaqSection } from '@/components/faq/FaqSection'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Straight answers about Red Sentinel: how Sentinels work, attack fees and payouts, jury verdicts, and why the arena runs on-chain.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/faq`,
  },
}

export default function FaqPage() {
  return (
    <div className="min-h-body bg-[var(--color-bg-base)]">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-3xl md:text-4xl">
            FAQ
          </h1>
          <p className="font-body mt-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] sm:text-sm">
            Straight answers about the arena. Attackers, defenders, and the curious: start here.
          </p>
        </div>
        <FaqSection items={FAQ_ITEMS} defaultOpenFirst />
      </div>
    </div>
  )
}
