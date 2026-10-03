import type { Metadata } from 'next'
import { SUI_SENTINEL_API_URL, SUI_SENTINEL_APP_URL } from '@/constants'
import TagPageView from '@/components/tags/TagPageView'
import type { TagPageResponse } from '@/types/tag-pages'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Public Tag Page (WO-20). Canonical Tag URL: /tags/:slug. Server-side
 * metadata carries the published title/description/hero image so shared
 * links preview the campaign content (AC-STL-002.3).
 */
async function fetchPublishedTagPage(slug: string): Promise<TagPageResponse | null> {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/tag-pages/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await fetchPublishedTagPage(slug)

  if (!page) {
    return {
      title: 'Tag Page Not Found',
      description: 'This tag page does not exist or is not publicly available.',
      robots: { index: false },
    }
  }

  const title = page.metadata.title
  const description =
    page.metadata.description ??
    page.metadata.share_copy ??
    `Mainnet activity, leaderboards, and Sentinels for the ${page.tag.name} tag.`
  const url = `${SUI_SENTINEL_APP_URL}/tags/${page.tag.slug}`
  const images = page.metadata.hero_image_url
    ? [{ url: page.metadata.hero_image_url, width: 1200, height: 630, alt: title }]
    : undefined

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Red Sentinel',
      images,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images?.map(image => image.url),
    },
  }
}

export default async function PublicTagPage({ params }: PageProps) {
  const { slug } = await params
  return <TagPageView slug={slug} />
}
