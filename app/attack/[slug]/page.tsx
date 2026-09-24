import { Metadata } from 'next'
import AgentChallengePageClient from './AgentChallengePageClient'
import { getAgentDataForOG } from '@/lib/agentData'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_X_USERNAME } from '@/constants'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: 'Red Sentinel',
      images: [
        {
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
      images: [`/attack/${slug}/opengraph-image`],
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
