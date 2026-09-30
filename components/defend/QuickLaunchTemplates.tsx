'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, ShieldCheck, Zap } from 'lucide-react'
import { SentinelTemplate } from '@/types'

interface QuickLaunchTemplatesProps {
  onSelect: (template: SentinelTemplate) => void
  onBrowse?: () => void
}

const QUICK_LAUNCH_COUNT = 4

export function QuickLaunchTemplates({ onSelect, onBrowse }: QuickLaunchTemplatesProps) {
  const [templates, setTemplates] = useState<SentinelTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates')
        const data = await res.json()
        if (cancelled || !Array.isArray(data)) return
        const mapped: SentinelTemplate[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          public_instructions: t.public_instructions,
          hidden_instructions: t.private_instructions,
          attack_goal: t.attack_goal,
          avatar_url: t.avatar_url,
          origin: (t.origin === 'team' ? 'team' : 'community') as 'team' | 'community',
          like_count: t.like_count ?? 0,
          comment_count: t.comment_count ?? 0,
        }))
        // Team picks first, then most liked
        const sorted = mapped.sort((a, b) => {
          if (a.origin !== b.origin) return a.origin === 'team' ? -1 : 1
          return (b.like_count ?? 0) - (a.like_count ?? 0)
        })
        setTemplates(sorted.slice(0, QUICK_LAUNCH_COUNT))
      } catch (err) {
        console.error('Error fetching quick launch templates:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchTemplates()
    return () => {
      cancelled = true
    }
  }, [])

  if (!isLoading && templates.length === 0) return null

  return (
    <section className="mx-auto mb-10 max-w-[969px] px-4">
      <div className="border-[var(--color-gold-primary)]/25 rounded-2xl border bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-primary)]">
              Quick Launch
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-2xl">
              Launch a Sentinel in one click
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-[var(--color-text-muted)]">
              Pick a battle-tested template: name, instructions, objective, and image are
              pre-filled. Nothing to write. Set your bounty and deploy.
            </p>
          </div>
          <Link
            href="/sentinel-templates"
            onClick={onBrowse}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-gold-primary)] transition-colors hover:text-[var(--color-gold-light)]"
          >
            Browse all templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: QUICK_LAUNCH_COUNT }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-[168px] animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
                />
              ))
            : templates.map(template => (
                <div
                  key={template.id}
                  className="group flex flex-col rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 transition-all hover:border-[var(--color-gold-primary)]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    {template.avatar_url ? (
                      <Image
                        src={template.avatar_url}
                        alt={template.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-xl border border-[var(--color-border-subtle)] object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)] text-lg font-bold text-[var(--color-text-muted)]">
                        {template.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        {template.name}
                      </p>
                      {template.origin === 'team' && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-gold-primary)]">
                          <ShieldCheck className="h-3 w-3" />
                          Official
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {template.attack_goal}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Heart className="h-3.5 w-3.5" />
                      {template.like_count ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelect(template)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-gold-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-on-gold)] transition-all hover:bg-[var(--color-gold-light)]"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      1-Click Launch
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-text-faint)]">
          Prefer full control? Configure everything yourself in the form below.
        </p>
      </div>
    </section>
  )
}
