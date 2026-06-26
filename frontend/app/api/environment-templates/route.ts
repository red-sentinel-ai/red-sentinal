import { NextResponse } from 'next/server'

import { REDTEAM_BASE, redteamAuthHeader } from '@/lib/redteam'

export async function GET() {
  try {
    const response = await fetch(`${REDTEAM_BASE}/environment-templates`, {
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
    console.error('Error listing environment templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
