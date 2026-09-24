import type { Metadata } from 'next'

import { SUI_SENTINEL_APP_URL } from '@/constants'
import { AttackStats } from '@/components/attack/AttackStats'
import { SentinelExplorer } from '@/components/explore/SentinelExplorer'

export const metadata: Metadata = {
  title: 'Explore Sentinels | Every Active Target',
  description:
    'The full sentinel directory. Filter by network, status, token, and pool size — every active target, ranked and sortable.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/attacks`,
  },
}

export default async function AttacksPage({
  searchParams,
}: {
  searchParams: Promise<{ chain?: string }>
}) {
  const { chain } = await searchParams

  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="px-3 py-6 md:px-12 md:py-12">
        {/* Compact trust strip — direct landings from links still get the pitch
            before the workbench. */}
        <section className="mx-auto mb-8 max-w-5xl md:mb-12">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            Explore Sentinels
          </h1>
          <p className="font-body mt-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] md:text-sm">
            Every active target in the arena, ranked and sortable.
          </p>
          <div className="mt-6 md:mt-8">
            <AttackStats variant="strip" />
          </div>
        </section>

        <SentinelExplorer initialChain={chain} />
      </div>
    </div>
  )
}
