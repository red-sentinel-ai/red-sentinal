import { Metadata } from 'next'
import AgentChallengePageClient from './AgentChallengePageClient'
import { getAgentDataForOG } from '@/lib/agentData'
import {
  SUI_SENTINEL_API_URL,
  SUI_SENTINEL_APP_URL,
  SUI_SENTINEL_X_USERNAME,
} from '@/constants'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const ATTACK_ID_PATTERN = /^[0-9a-fA-F]{24}$/

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const agent = await getAgentDataForOG(slug)

  if (!agent) {
    return {
      title: 'Agent Not Found',
      description: 'The requested AI agent could not be found.',
    }
  }

  const title = `Challenge ${agent.agent_name}`
  const description = `Attempt to defeat the AI agent "${agent.agent_name}". Outsmart its prompts and claim the on-chain bounty!`
  const url = `${SUI_SENTINEL_APP_URL}/attack/${slug}`

  // A shared run URL carries ?a=<attack id>; X's crawler then renders the
  // per-attack jury card from the backend instead of the Sentinel banner.
  // Anything that is not a 24-hex Mongo id falls back to the banner.
  const attackIdParam = (await searchParams).a
  const attackId =
    typeof attackIdParam === 'string' && ATTACK_ID_PATTERN.test(attackIdParam)
      ? attackIdParam
      : null
  const attackCardUrl = attackId
    ? `${SUI_SENTINEL_API_URL}/sentinels/attack/image/${attackId}`
    : null

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Red Sentinel',
      images: [
        attackCardUrl
          ? {
              url: attackCardUrl,
              width: 1200,
              height: 630,
              alt: `${agent.agent_name} — Red Sentinel jury card`,
            }
          : {
              url: agent.agent_profile,
              width: 1200,
              height: 630,
              alt: `Challenge banner for ${agent.agent_name}`,
            },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      creator: `@${SUI_SENTINEL_X_USERNAME}`,
      images: [attackCardUrl ?? agent.agent_profile],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function AgentChallengePage({ params }: PageProps) {
  const { slug } = await params
  return <AgentChallengePageClient slug={slug} />
}
