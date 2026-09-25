import type { Metadata } from 'next'
import { SyndicateDirectory } from '@/components/syndicates/SyndicateDirectory'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Syndicate Directory',
  description:
    'Groups of defenders pooling capital behind Sentinels and sharing defender-side attack-fee proceeds in proportion to contributions.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/syndicates`,
  },
  openGraph: {
    title: 'Syndicate Directory',
    description:
        'Connect with high-performance security collectives. Pool resources, deploy Sentinels together, and share proceeds in proportion to contributions.',
      url: `${SUI_SENTINEL_APP_URL}/syndicates`,
  },
}

export default function SyndicatesPage() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <SyndicateDirectory />
    </div>
  )
}
