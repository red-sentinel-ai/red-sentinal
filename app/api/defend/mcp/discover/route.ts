import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

/**
 * Connection check for an MCP server a Hosted Agent will use. The backend
 * performs the actual connector execution and discovery; until those
 * endpoints ship, this proxy surfaces the backend's response so the Launch
 * Form reports an honest failure instead of a verified connection.
 */
export async function POST(request: Request) {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}/connectors/mcp/discover`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
        },
        body: JSON.stringify(await request.json()),
        cache: 'no-store',
      }
    )

    const responseText = await response.text()
    if (!response.ok) {
      // Forward status and body verbatim — the failure reason is the UI's content.
      try {
        return NextResponse.json(JSON.parse(responseText), { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }
    return NextResponse.json(JSON.parse(responseText))
  } catch (error) {
    console.error('MCP discovery proxy error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
