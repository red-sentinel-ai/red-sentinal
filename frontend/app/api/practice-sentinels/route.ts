import { NextResponse } from 'next/server'

import { REDTEAM_BASE, redteamAuthHeader } from '@/lib/redteam'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'

    const params = new URLSearchParams({ page, limit, visibility: 'private' })

    const response = await fetch(`${REDTEAM_BASE}/sentinels?${params.toString()}`, {
      headers: { Authorization: redteamAuthHeader() },
      cache: 'no-store',
    })

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
