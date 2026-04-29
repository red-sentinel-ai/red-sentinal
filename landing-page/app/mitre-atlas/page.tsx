import type { Metadata } from 'next'
import { MITREATLASContent } from './MITREATLASContent'

export const metadata: Metadata = {
  title: 'MITRE ATLAS | AI Threat Framework | Red Sentinel',
  description:
    'MITRE ATLAS framework for adversarial threats to AI systems. Learn how Red Sentinel crowdsourced red teaming maps to ATLAS tactics and techniques for comprehensive AI security testing.',
  keywords: [
    'MITRE ATLAS',
    'AI threat framework',
    'adversarial ML',
    'ML security',
    'AI attack tactics',
    'AI threat intelligence',
    'adversarial threat matrix',
    'ML red teaming',
  ],
  openGraph: {
    title: 'MITRE ATLAS Framework | Red Sentinel',
    description:
      'Map MITRE ATLAS tactics and techniques to crowdsourced AI red teaming for comprehensive adversarial testing.',
    url: 'https://www.redsentinel.xyz/mitre-atlas',
    type: 'article',
  },
}

export default function MITREATLASPage() {
  return <MITREATLASContent />
}
