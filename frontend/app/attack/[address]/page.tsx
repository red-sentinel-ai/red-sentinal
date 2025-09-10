import { Metadata } from 'next'
import AgentChallengePageClient from './AgentChallengePageClient'

interface PageProps {
  params: Promise<{ address: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address: agentObjectId } = await params

  console.log({ resolvedParams: { agentObjectId } })

  const title = `Challenge Sui Sentinel`
  const description = `Attempt to defeat the AI agent on the Sui network. Outsmart its prompts and earn rewards!`

  return {
    title: title,
    description: description,
  }
}

export default async function AgentChallengePage({ params }: PageProps) {
  const { address: agentObjectId } = await params

  return <AgentChallengePageClient agentObjectId={agentObjectId} />
}
