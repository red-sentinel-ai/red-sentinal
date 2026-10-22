import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

/**
 * Preflight Validation for a connected Deployment Configuration: connectivity,
 * authentication, tool availability, session capabilities, evidence
 * capabilities, and the defender's fixtures. The backend orchestrates the
 * actual checks; this proxy forwards the Deployment Configuration verbatim.
 */
export async function POST(request: Request) {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}/connectors/preflight`,
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
      try {
        return NextResponse.json(JSON.parse(responseText), { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }
    return NextResponse.json(JSON.parse(responseText))
  } catch (error) {
    console.error('Preflight proxy error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
