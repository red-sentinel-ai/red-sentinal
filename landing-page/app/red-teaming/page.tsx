import type { Metadata } from 'next'
import { RedTeamingContent } from './RedTeamingContent'

export const metadata: Metadata = {
  title: 'AI Red Teaming Platform | Crowdsourced Security Testing | Red Sentinel',
  description:
    'The crowdsourced AI red teaming platform where security researchers test your AI systems. On-chain verified attacks, instant crypto payouts. Live on Sui & Solana Mainnet.',
  keywords: [
    'AI red teaming',
    'red teaming platform',
    'AI security testing',
    'LLM security',
    'prompt injection testing',
    'AI penetration testing',
    'crowdsourced security',
    'AI vulnerability testing',
    'adversarial AI testing',
    'bug bounty AI',
  ],
  openGraph: {
    title: 'AI Red Teaming Platform | Red Sentinel',
    description:
      'Crowdsourced AI security testing with on-chain verification and instant crypto payouts.',
    url: 'https://www.redsentinel.xyz/red-teaming',
    type: 'website',
  },
}

export default function RedTeamingPage() {
  return <RedTeamingContent />
}
