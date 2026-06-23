import { Metadata } from 'next'
import SyndicateChatPageClient from './SyndicateChatPageClient'

export const metadata: Metadata = {
  title: 'Syndicate Chat | Sui Sentinel',
}

export default async function SyndicateChatPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params
  return <SyndicateChatPageClient identifier={address} />
}
