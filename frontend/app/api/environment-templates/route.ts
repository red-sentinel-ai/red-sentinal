import { NextResponse } from 'next/server'

import { BACKEND_API_ADMIN_TOKEN, SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

export async function GET() {
  try {
    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}/environment-templates`,
      {
        headers: { Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}` },
        cache: 'no-store',
      }
    )

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
