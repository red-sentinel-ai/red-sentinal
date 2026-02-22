import type { Metadata } from 'next'
import { DemoRequestContent } from './DemoRequestContent'

export const metadata: Metadata = {
  title: 'Book a Demo | Enterprise AI Security | Sui Sentinel',
  description:
    'Schedule a personalized demo of Sui Sentinel Enterprise. See how our crowdsourced AI red teaming platform can secure your AI agents.',
  keywords: [
    'AI security demo',
    'Sui Sentinel Enterprise',
    'AI red teaming demo',
    'enterprise AI security',
    'book demo AI security',
  ],
  openGraph: {
    title: 'Book a Demo | Sui Sentinel Enterprise',
    description: 'Schedule a personalized demo of our enterprise AI security platform.',
    url: 'https://suisentinel.xyz/demo',
    type: 'website',
  },
}

export default function BookDemoPage() {
  return <DemoRequestContent />
}
