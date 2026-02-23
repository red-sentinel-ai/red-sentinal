import type { Metadata } from 'next'
import { ForAttackersContent } from './ForAttackersContent'

export const metadata: Metadata = {
  title: 'Get Paid to Break AI | Red Teamer Community | Sui Sentinel',
  description:
    "Join the world's first crowdsourced AI red teaming community. Find vulnerabilities, break AI systems ethically, and earn crypto rewards instantly on Sui.",
  keywords: [
    'AI red teaming jobs',
    'get paid to hack AI',
    'AI bug bounty',
    'prompt injection expert',
    'AI security researcher',
    'earn crypto hacking',
    'AI penetration testing',
    'red team community',
  ],
  openGraph: {
    title: 'Get Paid to Break AI | Sui Sentinel',
    description:
      'Join the crowdsourced AI red teaming community. Break AI systems ethically and earn instant crypto rewards.',
    url: 'https://suisentinel.xyz/for-attackers',
    type: 'website',
  },
}

export default function ForAttackersPage() {
  return <ForAttackersContent />
}
