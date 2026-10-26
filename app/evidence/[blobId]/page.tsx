import type { Metadata } from 'next'
import Link from 'next/link'

import { EvidenceRecordView } from '@/components/evidence/EvidenceRecordView'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import { fetchEvidenceBlob, isValidBlobId } from '@/lib/evidence'

export const dynamic = 'force-dynamic'

interface EvidenceBlobPageProps {
  params: Promise<{ blobId: string }>
}

export async function generateMetadata({ params }: EvidenceBlobPageProps): Promise<Metadata> {
  const { blobId } = await params
  const shortId = blobId.length > 16 ? `${blobId.slice(0, 10)}…${blobId.slice(-6)}` : blobId
  return {
    title: `Evidence ${shortId} | Verified on Walrus`,
    description:
      'A Red Sentinel attack evidence record stored permanently on Walrus — attack prompt, Sentinel agent response, and jury verdict, verifiable by anyone.',
    alternates: {
      canonical: `${SUI_SENTINEL_APP_URL}/evidence/${blobId}`,
    },
  }
}

export default async function EvidenceBlobPage({ params }: EvidenceBlobPageProps) {
  const { blobId } = await params

  // Invalid ids can never exist on Walrus — skip the aggregator round-trip.
  const result = isValidBlobId(blobId)
    ? await fetchEvidenceBlob(blobId)
    : ({ status: 'not-found' } as const)

  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="px-3 py-6 md:px-12 md:py-12">
        <section className="mx-auto mb-8 max-w-5xl">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-3xl">
            Attack Evidence
          </h1>
          <p className="font-body mt-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] md:text-sm">
            Permanent record stored on Walrus, rendered straight from the stored bytes.{' '}
            <Link
              href="/evidence"
              className="industrial-header text-[var(--color-gold-primary)] hover:text-white"
            >
              ALL_EVIDENCE
            </Link>
          </p>
        </section>

        <div className="mx-auto max-w-5xl">
          <EvidenceRecordView blobId={blobId} result={result} />
        </div>
      </div>
    </div>
  )
}
