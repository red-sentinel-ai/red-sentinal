import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Admin proxy for the live-Sentinel RAG document inventory
 * (GET) and document creation (POST). The backend admin token is attached
 * server-side and never exposed to the browser.
 *
 * GET  /api/sentinels/rag/documents?network=mainnet&sentinel_id=1
 * POST /api/sentinels/rag/documents?network=mainnet&sentinel_id=1  body: { title?, content }
 */

async function proxy(req: Request, network: string, sentinelId: string, init?: RequestInit) {
  const backendUrl = `${SUI_SENTINEL_API_URL}/sentinels/${encodeURIComponent(network)}/rag/${encodeURIComponent(sentinelId)}/documents`

  const response = await fetch(backendUrl, {
    cache: 'no-store',
    ...init,
    headers: {
      Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
      ...(init?.headers ?? {}),
    },
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
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const network = searchParams.get('network')
    const sentinelId = searchParams.get('sentinel_id')

    if (!network || !sentinelId) {
      return NextResponse.json({ error: 'network and sentinel_id are required' }, { status: 400 })
    }

    return await proxy(req, network, sentinelId)
  } catch (error) {
    console.error('[RAG documents proxy] GET failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const network = searchParams.get('network')
    const sentinelId = searchParams.get('sentinel_id')

    if (!network || !sentinelId) {
      return NextResponse.json({ error: 'network and sentinel_id are required' }, { status: 400 })
    }

    const body = await req.text()
    return await proxy(req, network, sentinelId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (error) {
    console.error('[RAG documents proxy] POST failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
