import type { Metadata } from 'next'
import { OWASPLLMContent } from './OWASPLLMContent'

export const metadata: Metadata = {
  title: 'OWASP LLM Top 10 2025 | AI Security Framework | Red Sentinel',
  description:
    'Understand the OWASP Top 10 for LLM Applications 2025. Learn how Red Sentinel crowdsourced red teaming helps you test for prompt injection, data exposure, and other critical LLM vulnerabilities.',
  keywords: [
    'OWASP LLM Top 10',
    'OWASP 2025',
    'LLM security framework',
    'LLM vulnerabilities',
    'LLM01 prompt injection',
    'LLM02 sensitive data exposure',
    'AI security testing',
    'LLM risk assessment',
  ],
  openGraph: {
    title: 'OWASP LLM Top 10 2025 | Red Sentinel',
    description:
      'Comprehensive guide to OWASP LLM Top 10 2025 vulnerabilities and how crowdsourced red teaming addresses them.',
    url: 'https://www.redsentinel.xyz/owasp-llm-top-10',
    type: 'article',
  },
}

export default function OWASPLLMPage() {
  return <OWASPLLMContent />
}
