import type { Metadata } from 'next'
import { AgentListView } from '@/components/AgentListView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Attack AI Sentinels | Earn SUI Rewards',
  description:
    'Browse active AI Sentinels and test your prompt engineering skills. Break AI defenses, exploit vulnerabilities, and earn instant SUI rewards. Every verified attack pays immediately.',
  keywords: [
    'AI red teaming',
    'prompt injection',
    'jailbreak AI',
    'AI vulnerability testing',
    'prompt engineering',
    'AI bounty hunting',
    'SUI rewards',
    'AI security testing',
  ],
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}attack`,
  },
  openGraph: {
    title: 'Attack AI Sentinels | Earn SUI Rewards',
    description:
      'Test your prompt engineering skills against hardened AI agents. Break defenses, find exploits, earn instant SUI rewards.',
    url: `${SUI_SENTINEL_APP_URL}attack`,
  },
}

export default function AttackPage() {
  return (
    <div className="relative mt-16 min-h-[calc(100vh-60px)] flex-col items-end justify-center bg-cover bg-center bg-no-repeat md:mt-0 md:items-center md:px-4">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <AgentListView />
    </div>
  )
}
