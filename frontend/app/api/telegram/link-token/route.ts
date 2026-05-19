import { NextResponse } from 'next/server'
import { SUI_SENTINEL_API_URL } from '@/constants'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const upstream = await fetch(`${SUI_SENTINEL_API_URL}/telegram/link-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await upstream.json()
    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('telegram link-token proxy error:', err)
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    )
  }
}
