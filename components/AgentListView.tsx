'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { useFeaturedAgents } from '@/hooks/agents/useFeaturedAgents'
import { useTrendingAgents, MAX_TRENDING_SENTINELS } from '@/hooks/agents/useTrendingAgents'
import { useDefeatedAgents } from '@/hooks/agents/useDefeatedAgents'
import { usePlatformStats } from '@/hooks/stats/usePlatformStats'
import { cn } from '@/lib/utils'
import { PREMIUM_SENTINEL, PARTNER_CONTACT_URL } from '@/constants'
import { CHAINS, SUPPORTED_CHAINS } from '@/constants/chains'
import { isSentinelAttackable } from '@/lib/sentinel-status'
import { AttackStats } from '@/components/attack/AttackStats'
// Will be enabled once we have real data from backend.
// import { LiveActivityFeed } from '@/components/attack/LiveActivityFeed'
import { SentinelMarquee } from '@/components/attack/SentinelMarquee'
import { SentinelRowSkeleton } from '@/components/attack/SentinelRowSkeleton'
import { BrokenSentinelCard } from '@/components/attack/BrokenSentinelCard'
import { ArenaHowItWorks } from '@/components/attack/ArenaHowItWorks'
import { LaunchASentinel } from '@/components/attack/LaunchASentinel'
import { FormSyndicate } from '@/components/attack/FormSyndicate'
import { SentinelTypesSplit } from '@/components/attack/SentinelTypesSplit'
import { FaqSection } from '@/components/faq/FaqSection'
import { FAQ_ITEMS, LANDING_FAQ_COUNT } from '@/constants/faq'

/** The landing page — spectacle and story. The full sortable directory lives
 *  on /attacks (SentinelExplorer); this page only curates. */
export const AgentListView = () => {
  const { data: platformStats } = usePlatformStats()
  const { data: featuredAgents, isPending: isFetchingFeatured } = useFeaturedAgents(true)
  const { data: trendingAgents, isPending: isFetchingTrending } = useTrendingAgents(true)
  const { data: defeatedAgents, isPending: isFetchingDefeated } = useDefeatedAgents(true)

  const featuredForRow = (featuredAgents || []).filter(isSentinelAttackable)
  const featuredIds = new Set(featuredForRow.map(a => a.agent_id))

  const trendingForRow = (trendingAgents || [])
    .filter(isSentinelAttackable)
    .filter(a => !featuredIds.has(a.agent_id))
    .slice(0, MAX_TRENDING_SENTINELS)

  // Defender proof for "Launch a Sentinel": the top two earners still standing
  // among the agents this page already fetches — surviving attacks is the
  // earning mechanic. Attacks survived breaks ties when fees aren't populated.
  const defenderPicks = useMemo(
    () =>
      [...featuredForRow, ...trendingForRow]
        .filter(a => a.total_attacks > 0)
        .sort(
          (a, b) =>
            (b.accumulated_fees ?? 0) - (a.accumulated_fees ?? 0) ||
            b.total_attacks - a.total_attacks
        )
        .slice(0, 2),
    [featuredForRow, trendingForRow]
  )

  const sentinelsLive = platformStats?.activeSentinels

  return (
    <div className="px-3 py-6 md:px-12 md:py-12">
      <section className="relative mx-auto mb-10 max-w-5xl py-4 text-center md:mb-20 md:py-12">
        {/* Subtle surface glow — anchors the hero text to a surface instead of
            floating on the flat base bg (Aave Pro-style elevation, same #100f0f base). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-20%] bottom-0 top-[-10%]"
          style={{
            background:
              'radial-gradient(ellipse 55% 60% at 50% 35%, rgba(255,255,255,0.05), transparent 70%)',
          }}
        />
        <h1 className="font-display relative text-3xl font-extrabold leading-[1.08] tracking-[0.04em] text-white sm:text-4xl md:text-7xl">
          Put AI agents to the test
        </h1>
        {/* New landing hero type scale: no extrabold below heading sizes, min 11px for
            readable copy, tracking tightened on small text, sentence case for anything
            with a verb. Old sections still use the legacy 9–10px extrabold/0.1em style. */}
        <p className="font-body relative mx-auto mt-4 max-w-2xl text-sm font-normal leading-[1.7] tracking-[0.01em] text-[var(--color-text-secondary)] sm:mt-6 sm:text-base">
          Attack live Sentinels for on-chain bounties. Launch a Campaign Sentinel to engage your
          community, or a Security Sentinel to test a real AI-agent boundary
        </p>
        <div className="mt-6 sm:mt-8">
          <AttackStats variant="strip" />
        </div>
        <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <Link
            href={`/attack/${PREMIUM_SENTINEL.agentPath}`}
            className="font-body inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-black transition-colors hover:bg-transparent hover:text-white sm:px-8"
          >
            Attack {PREMIUM_SENTINEL.name} <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/practice"
            className="font-body inline-flex items-center gap-2 border border-[var(--color-border-default)] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white sm:px-8"
          >
            Try free in Practice Arena
          </Link>
        </div>
        <p className="font-body relative mt-4 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-5 sm:text-xs">
          Partner or project?{' '}
          <a
            href={PARTNER_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline underline-offset-2 transition-colors hover:text-[var(--color-text-secondary)]"
          >
            Talk to the team
          </a>{' '}
          about a sponsored Campaign Sentinel.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            LIVE ON:
          </span>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {SUPPORTED_CHAINS.map(chainId => {
              const chain = CHAINS[chainId]
              return (
                <Link
                  key={chainId}
                  href={`/attacks?chain=${chainId}`}
                  className="font-body inline-flex items-center gap-2 border border-[var(--color-border-default)] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-secondary)] transition-colors hover:border-white hover:text-white sm:px-5 sm:text-[11px]"
                >
                  <Image
                    src={chain.icon}
                    alt=""
                    width={14}
                    height={14}
                    className={cn('rounded-full', chain.iconFilterClass)}
                  />
                  {chain.name}
                </Link>
              )
            })}
          </div>
        </div>
        <p className="font-body relative mt-4 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-5 sm:text-xs">
          Every attack, verdict, and payout is a real on-chain transaction
        </p>
      </section>

      {/* Two entry points — partners and builders — before the Sentinel lists. */}
      <SentinelTypesSplit />

      {/* Live Activity — the arena is alive, proven within five seconds. */}
      {/* <LiveActivityFeed /> */}

      {/* Recently Broken — proof the game is winnable. Renders nothing until the
          first public win exists, so the page never shows an empty shelf. */}
      {(isFetchingDefeated || (defeatedAgents || []).length > 0) && (
        <section className="mb-10 md:mb-20">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Recently Broken
              </h2>
              <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
                Pools get claimed here. Every break is public. Every winner is paid on-chain. This
                is what skill looks like.
              </p>
            </div>
          </div>
          {isFetchingDefeated ? (
            <SentinelRowSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(defeatedAgents || []).map(agent => (
                <BrokenSentinelCard key={agent.agent_id} agent={agent} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending Sentinels — auto-scrolling row (deduped against Featured) */}
      {(isFetchingTrending || trendingForRow.length > 0) && (
        <section className="mb-10 md:mb-20">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Trending Sentinels
              </h2>
              <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
                The most-attacked sentinels right now. Where the action is.
              </p>
            </div>
            <Link
              href="/attacks"
              className="font-body hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white hover:underline sm:inline-flex"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {isFetchingTrending ? (
            <SentinelRowSkeleton />
          ) : (
            <SentinelMarquee agents={trendingForRow} variant="trending" />
          )}
        </section>
      )}

      {(isFetchingFeatured || featuredForRow.length > 0) && (
        <section className="mb-10 md:mb-20">
          <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
                Featured Sentinels
              </h2>
              <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
                Featured pools from across the arena — Security and Campaign Sentinels alike.
              </p>
            </div>
            <Link
              href="/attacks"
              className="font-body hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white hover:underline sm:inline-flex"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {isFetchingFeatured ? (
            <SentinelRowSkeleton />
          ) : (
            <SentinelMarquee agents={featuredForRow} variant="featured" />
          )}
        </section>
      )}

      {/* Explore all — slim hand-off row from story to workbench. Kept compact
          on purpose: it's a pointer to the directory, not a section. */}
      <section className="mb-10 md:mb-20">
        <Link
          href="/attacks"
          className="group flex flex-col gap-3 border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-4 py-4 transition-colors hover:border-white sm:flex-row sm:items-center sm:justify-between sm:px-6 md:py-5"
        >
          <div className="min-w-0">
            <p className="font-display text-base font-extrabold uppercase tracking-[0.04em] text-white sm:text-lg">
              Explore all
              {typeof sentinelsLive === 'number' ? ` ${sentinelsLive.toLocaleString()}` : ''}{' '}
              sentinels
            </p>
            <p className="font-body mt-1 hidden text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:block">
              Filter by network, status, token, and pool size. Find your edge.
            </p>
          </div>
          <span className="font-body inline-flex shrink-0 items-center gap-2 border border-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors group-hover:bg-white group-hover:text-black sm:px-5">
            Browse <ArrowRight className="size-3.5" />
          </span>
        </Link>
      </section>

      {/* How It Works — five-second comprehension of the game before the pitch ends. */}
      <section className="mb-10 md:mb-20">
        <div className="mb-5 md:mb-8">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
            How the Arena Works
          </h2>
          <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
            Three moves. Five seconds. That&apos;s the whole game.
          </p>
        </div>
        <ArenaHowItWorks />
      </section>

      {/* Launch a Sentinel — the supply side, two paths. No defenders, no arena. */}
      <LaunchASentinel
        sentinels={defenderPicks}
        isFetching={isFetchingFeatured || isFetchingTrending}
      />

      {/* Syndicates — the collective supply side. No pools alone, fortresses together. */}
      <FormSyndicate />

      {/* FAQ — close the open loops before the visitor bounces. Full list on /faq. */}
      <section className="mb-10 md:mb-20">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-2xl">
              FAQ
            </h2>
            <p className="font-body mt-1.5 text-[11px] font-medium tracking-normal text-[var(--color-text-secondary)] sm:mt-2">
              The questions everyone asks before their first attack.
            </p>
          </div>
          <Link
            href="/faq"
            className="font-body hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white hover:underline sm:inline-flex"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <FaqSection items={FAQ_ITEMS.slice(0, LANDING_FAQ_COUNT)} />
      </section>
    </div>
  )
}
