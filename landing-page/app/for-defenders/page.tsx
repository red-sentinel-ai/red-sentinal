import type { Metadata } from 'next'
import { ForDefendersContent } from './ForDefendersContent'

export const metadata: Metadata = {
  title: 'Secure Your AI Agents | Defender Platform | Red Sentinel',
  description:
    'Deploy your AI as a Sentinel and let the global red team community find vulnerabilities before attackers do. Earn from attack fees while improving your security. Live on Sui Mainnet.',
  keywords: [
    'AI security',
    'secure AI agents',
    'LLM security platform',
    'AI vulnerability testing',
    'AI defense',
    'prompt injection protection',
    'AI safety testing',
    'continuous AI security',
  ],
  openGraph: {
    title: 'Secure Your AI Agents | Red Sentinel',
    description:
      'Deploy your AI as a Sentinel. Get continuous security testing from a global red team community.',
    url: 'https://www.redsentinel.xyz/for-defenders',
    type: 'website',
  },
}

export default function ForDefendersPage() {
  return <ForDefendersContent />
}
