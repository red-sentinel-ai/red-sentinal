import type { Metadata } from 'next'

import { PracticeAttackView } from '@/components/practice/PracticeAttackView'
import { SUI_SENTINEL_APP_URL } from '@/constants'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Practice Attack #${id}`,
    description:
      'Practice your prompt-injection attacks against this sentinel. No wallet, no stakes.',
    alternates: {
      canonical: `${SUI_SENTINEL_APP_URL}/practice/${id}`,
    },
  }
}

export default async function PracticeAttackPage({ params }: PageProps) {
  const { id } = await params
  return <PracticeAttackView sentinelId={Number(id)} />
}
