import type { Metadata } from 'next'
import Link from 'next/link'

import { ReportsDirectory } from '@/components/reports/ReportsDirectory'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Security Reports | Per-Sentinel Security Track Records',
  description:
    'Aggregate security reports for every Sentinel on Red Sentinel: attack summaries, classifications, security scores, and the Walrus evidence blobs behind every claim. Shareable and verifiable without a wallet.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/reports`,
  },
}

export default function ReportsPage() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="px-3 py-6 md:px-12 md:py-12">
        <section className="mx-auto mb-8 max-w-5xl md:mb-12">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            Security Reports
          </h1>
          <p className="font-body mt-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] md:text-sm">
            Each Sentinel&apos;s security track record in one shareable report — every attack
            attempted, how it was classified, how the Sentinel held up, and the immutable Walrus
            evidence behind each number.{' '}
            <Link
              href="/evidence"
              className="industrial-header text-[var(--color-gold-primary)] hover:text-white"
            >
              EVIDENCE_EXPLORER
            </Link>
          </p>
        </section>

        <div className="mx-auto max-w-5xl">
          <ReportsDirectory />
        </div>
      </div>
    </div>
  )
}
