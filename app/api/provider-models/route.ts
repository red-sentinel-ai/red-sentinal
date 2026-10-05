import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'

/**
 * Public proxy for the admin-managed provider→models catalogue the deploy
 * modal renders its LLM provider/model dropdowns from.
 */
export async function GET() {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/provider-models`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching provider models:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
