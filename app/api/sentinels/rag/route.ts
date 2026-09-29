import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Admin proxy for clearing a live Sentinel's whole RAG knowledge base.
 * The backend removes every chunk from the Sentinel's namespace and
 * disables RAG for the Sentinel.
 *
 * DELETE /api/sentinels/rag?network=mainnet&sentinel_id=1
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const network = searchParams.get('network')
    const sentinelId = searchParams.get('sentinel_id')

    if (!network || !sentinelId) {
      return NextResponse.json({ error: 'network and sentinel_id are required' }, { status: 400 })
    }

    const backendUrl = `${SUI_SENTINEL_API_URL}/sentinels/${encodeURIComponent(network)}/rag/${encodeURIComponent(sentinelId)}`

    const response = await fetch(backendUrl, {
      cache: 'no-store',
      method: 'DELETE',
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
    console.error('[RAG clear proxy] DELETE failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
