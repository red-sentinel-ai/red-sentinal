import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SUI_SENTINEL_APP_URL } from '@/constants'

import RagContentPageClient from './RagContentPageClient'

export const metadata: Metadata = {
  title: 'RAG Content Management | Red Sentinel',
  description:
    'Manage the knowledge documents a live Sentinel retrieves during attacks: add, replace, inspect chunks, delete, or clear content.',
  alternates: {
    canonical: `${SUI_SENTINEL_APP_URL}/defend/rag`,
  },
}

export default function RagContentPage() {
  return (
    <Suspense>
      <RagContentPageClient />
    </Suspense>
  )
}
