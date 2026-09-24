import type { Metadata } from 'next'

import { PracticeListView } from '@/components/practice/PracticeListView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

export const metadata: Metadata = {
  title: 'Practice Sentinels | Train Your AI Attacks',
  description:
    'Sharpen your prompt-injection skills against practice AI Sentinels. No wallet, no stakes — just you, the agent, and the jury.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/practice`,
  },
  openGraph: {
    title: 'Practice Sentinels | Train Your AI Attacks',
    description:
      'Sharpen your prompt-injection skills against practice AI Sentinels. No wallet, no stakes.',
    url: `${SUI_SENTINEL_APP_URL}/practice`,
  },
}

export default function PracticePage() {
  return (
    <div className="relative min-h-full bg-[var(--color-bg-base)]">
      <PracticeListView />
    </div>
  )
}
