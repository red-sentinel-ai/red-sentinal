import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SentinelReportView } from '@/components/reports/SentinelReportView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

interface SentinelReportPageProps {
  params: Promise<{ sentinelId: string }>
}

function parseSentinelId(raw: string): number | null {
  return /^[0-9]+$/.test(raw) ? Number(raw) : null
}

export async function generateMetadata({ params }: SentinelReportPageProps): Promise<Metadata> {
  const { sentinelId } = await params
  return {
    title: `Sentinel #${sentinelId} Security Report | Red Sentinel`,
    description:
      'Verifiable security track record for a Red Sentinel AI agent: attacks attempted, classifications, outcomes, aggregate security score, and the Walrus evidence blobs behind every claim.',
    alternates: {
      canonical: `${SUI_SENTINEL_APP_URL}/reports/${sentinelId}`,
    },
  }
}

export default async function SentinelReportPage({ params }: SentinelReportPageProps) {
  const { sentinelId: raw } = await params
  const sentinelId = parseSentinelId(raw)
  if (sentinelId === null) notFound()

  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="px-3 py-6 md:px-12 md:py-12">
        <div className="mx-auto mb-6 max-w-5xl">
          <Link
            href="/reports"
            className="industrial-header text-xs text-[var(--color-gold-primary)] hover:text-white"
          >
            ← ALL_REPORTS
          </Link>
        </div>
        <div className="mx-auto max-w-5xl">
          <SentinelReportView sentinelId={sentinelId} />
        </div>
      </div>
    </div>
  )
}
