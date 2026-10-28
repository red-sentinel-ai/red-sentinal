import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { PRACTICE_NETWORK } from '@/lib/practice'
import { rateLimit } from '@/lib/server/rate-limit'

export async function GET(req: Request) {
  const denied = rateLimit(req, { name: 'practice-sentinels', limit: 60, windowMs: 60_000 })
  if (denied) return denied

  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'

    const params = new URLSearchParams({ page, limit, visibility: 'private' })

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}?${params.toString()}`,
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
    console.error('Error listing practice sentinels:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
