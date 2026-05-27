import { Metadata } from 'next'
import SyndicatePageClient from './SyndicatePageClient'

export const metadata: Metadata = {
  title: 'Syndicate | Sui Sentinel',
}

export default async function SyndicatePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  return <SyndicatePageClient identifier={address} />
}
