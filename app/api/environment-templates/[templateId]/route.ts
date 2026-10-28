import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { PRACTICE_NETWORK } from '@/lib/practice'
import { rateLimit } from '@/lib/server/rate-limit'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const denied = rateLimit(req, { name: 'env-template-detail', limit: 60, windowMs: 60_000 })
  if (denied) return denied

  try {
    const { templateId } = await params

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}/environment-templates/${templateId}`,
      {
        headers: { Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}` },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching environment template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
