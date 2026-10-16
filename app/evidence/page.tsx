import type { Metadata } from 'next'
import Link from 'next/link'

import { EvidenceExplorer } from '@/components/evidence/EvidenceExplorer'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Evidence Explorer | On-Chain Attack Evidence on Walrus',
  description:
    'Every completed attack on Red Sentinel mints a permanent, verifiable evidence record on Walrus. Browse recent evidence blobs, verify any blob id straight from Walrus storage, and share permalinks — no wallet or Sui node required.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/evidence`,
  },
}

export default function EvidencePage() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="px-3 py-6 md:px-12 md:py-12">
        <section className="mx-auto mb-8 max-w-5xl md:mb-12">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            Evidence Explorer
          </h1>
          <p className="font-body mt-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] md:text-sm">
            Every attack verdict on Red Sentinel is stored as a permanent, immutable record on
            Walrus — the attack prompt, the Sentinel agent&apos;s response, and the jury score.
            Read the raw blob, verify it independently, share it with anyone.
          </p>
        </section>

        <div className="mx-auto max-w-5xl">
          <EvidenceExplorer />
        </div>

        <section className="mx-auto mt-10 max-w-5xl rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] p-5 text-xs text-[var(--color-text-muted)] md:p-6 md:text-sm">
          <p>
            How it works: when an attack completes inside the TEE verification environment, the
            record is written to Walrus and its blob id is anchored on Sui. This page reads blobs
            directly from the public Walrus aggregator — the same bytes anyone can fetch with a
            plain HTTP request.{' '}
            <Link
              href="https://docs.redsentinel.xyz/walrus/overview"
              className="industrial-header text-[var(--color-gold-primary)] hover:text-white"
            >
              READ_THE_DOCS
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
