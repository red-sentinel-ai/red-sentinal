import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SUI_SENTINEL_API_URL } from '@/constants'
import type { TagPageResponse } from '@/types/tag-pages'

interface PageProps {
  params: Promise<{ custom: string }>
}

export const metadata: Metadata = {
  title: 'Tag Page',
  robots: { index: false },
}

/**
 * Web resolution for a Custom Promotional URL (AC-STL-001.2): /p/:custom
 * redirects to the assigned Tag's canonical /tags/:slug page. Unassigned
 * URLs and unpublished pages must not display content (AC-STL-001.4/.3), so
 * the redirect only happens on a published resolution and everything else
 * renders the same no-content state as an unknown slug.
 */
async function resolveCustomUrl(custom: string): Promise<TagPageResponse | null> {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/tag-pages/by-url/${encodeURIComponent(custom)}`,
      { cache: 'no-store' }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function PromotionalTagRedirect({ params }: PageProps) {
  const { custom } = await params

  // The API only returns a payload for a published page, so this redirect
  // preserves the administrator's canonical URL as the shared destination.
  const page = await resolveCustomUrl(custom)
  if (page) {
    redirect(`/tags/${page.tag.slug}`)
  }

  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <div className="mx-auto max-w-5xl px-3 py-6 md:px-12 md:py-12">
        <div className="flex flex-col items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-24 text-center">
          <h1 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-white">
            Page Not Found
          </h1>
          <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
            This tag page does not exist or is not publicly available.
          </p>
        </div>
      </div>
    </div>
  )
}
