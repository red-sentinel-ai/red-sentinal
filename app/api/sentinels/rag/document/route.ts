import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Admin proxy for one live-Sentinel RAG Content Document:
 *   GET    — read with reconstructed content and ordered chunks
 *   PUT    — replace content (prior revision preserved on indexing failure)
 *   DELETE — remove only that document's chunks
 *
 * The backend admin token is attached server-side.
 *
 * /api/sentinels/rag/document?network=mainnet&sentinel_id=1&document_id=<id>
 */

async function proxy(
  req: Request,
  network: string,
  sentinelId: string,
  documentId: string,
  init?: RequestInit
) {
  const backendUrl = `${SUI_SENTINEL_API_URL}/sentinels/${encodeURIComponent(network)}/rag/${encodeURIComponent(sentinelId)}/documents/${encodeURIComponent(documentId)}`

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

function readParams(req: Request) {
  const { searchParams } = new URL(req.url)
  return {
    network: searchParams.get('network'),
    sentinelId: searchParams.get('sentinel_id'),
    documentId: searchParams.get('document_id'),
  }
}

export async function GET(req: Request) {
  try {
    const { network, sentinelId, documentId } = readParams(req)
    if (!network || !sentinelId || !documentId) {
      return NextResponse.json(
        { error: 'network, sentinel_id and document_id are required' },
        { status: 400 }
      )
    }
    return await proxy(req, network, sentinelId, documentId)
  } catch (error) {
    console.error('[RAG document proxy] GET failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { network, sentinelId, documentId } = readParams(req)
    if (!network || !sentinelId || !documentId) {
      return NextResponse.json(
        { error: 'network, sentinel_id and document_id are required' },
        { status: 400 }
      )
    }
    const body = await req.text()
    return await proxy(req, network, sentinelId, documentId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } catch (error) {
    console.error('[RAG document proxy] PUT failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { network, sentinelId, documentId } = readParams(req)
    if (!network || !sentinelId || !documentId) {
      return NextResponse.json(
        { error: 'network, sentinel_id and document_id are required' },
        { status: 400 }
      )
    }
    return await proxy(req, network, sentinelId, documentId, { method: 'DELETE' })
  } catch (error) {
    console.error('[RAG document proxy] DELETE failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
