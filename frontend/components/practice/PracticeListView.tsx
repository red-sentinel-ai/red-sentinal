'use client'

import { useMemo, useState } from 'react'
import { Loader2, Search, ShieldX, Swords } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePracticeSentinels } from '@/hooks/practice/usePracticeSentinels'
import type { PracticeSentinel } from '@/types/practice'
import { PracticeSentinelGrid } from './PracticeSentinelGrid'

export function PracticeListView() {
  const { data, isPending, isError } = usePracticeSentinels()
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()

  const { activeSentinels, breachedSentinels } = useMemo(() => {
    const matchesSearch = (sentinel: PracticeSentinel) =>
      !normalizedSearch ||
      [
        sentinel.name,
        sentinel.attack_goal,
        sentinel.public_instructions,
        sentinel.model_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)

    const matching = (data?.sentinels ?? []).filter(matchesSearch)
    return {
      activeSentinels: matching.filter(sentinel => !sentinel.is_breached),
      breachedSentinels: matching.filter(sentinel => sentinel.is_breached),
    }
  }, [data, normalizedSearch])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-12">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 border-b border-[var(--color-border-default)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="industrial-header mb-3 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
            <Swords className="h-3.5 w-3.5" />
            Training Arena
          </p>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-[0.04em] text-white md:text-4xl">
            Practice Sentinels
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
            Sharpen your prompt-injection skills against practice sentinels. No
            wallet, no stakes — just you, the agent, and the jury.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sentinels…"
            className="h-11 w-full border border-[var(--color-border-default)] bg-[var(--color-bg-base)] pl-10 pr-3 text-sm text-white placeholder:text-[var(--color-text-muted)] focus:border-white/45 focus:outline-none"
          />
        </div>
      </div>

      {/* States */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <ShieldX className="h-8 w-8 text-[var(--color-text-muted)]" />
          <p className="industrial-header text-sm text-[var(--color-text-muted)]">
            FAILED_TO_LOAD_SENTINELS
          </p>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <nav className="mb-8 flex items-center border-b border-[var(--color-border-subtle)]">
            <TabsList className="flex h-auto gap-0 bg-transparent p-0">
              <TabsTrigger value="active" className="profile-tab-trigger">
                <Swords className="h-4 w-4" />
                Active ({activeSentinels.length})
              </TabsTrigger>
              <TabsTrigger value="breached" className="profile-tab-trigger">
                <ShieldX className="h-4 w-4" />
                Breached ({breachedSentinels.length})
              </TabsTrigger>
            </TabsList>
          </nav>

          <TabsContent value="active">
            <PracticeSentinelGrid
              sentinels={activeSentinels}
              emptyMessage={
                normalizedSearch
                  ? 'No unbreached sentinels match your search.'
                  : 'No practice sentinels available yet.'
              }
            />
          </TabsContent>

          <TabsContent value="breached">
            <PracticeSentinelGrid
              sentinels={breachedSentinels}
              emptyMessage={
                normalizedSearch
                  ? 'No breached sentinels match your search.'
                  : 'No practice sentinel has been breached yet.'
              }
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
