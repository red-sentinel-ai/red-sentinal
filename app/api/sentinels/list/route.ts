import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Admin proxy listing live Sentinels on a network, used by the RAG content
 * management sentinel picker.
 *
 * GET /api/sentinels/list?network=mainnet
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const network = searchParams.get('network')

    if (!network) {
      return NextResponse.json({ error: 'network is required' }, { status: 400 })
    }

    const backendUrl = `${SUI_SENTINEL_API_URL}/sentinels/${encodeURIComponent(network)}?limit=100`

    const response = await fetch(backendUrl, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}` },
    })

    if (!response.ok) {
      const body = await response.text()
      let message = body
      try {
        message = JSON.parse(body).message ?? JSON.parse(body).error ?? body
      } catch {
        // Non-JSON backend error — forward the raw text.
      }
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Sentinel list proxy] GET failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
