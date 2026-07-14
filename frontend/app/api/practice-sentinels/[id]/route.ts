import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { PRACTICE_NETWORK } from '@/lib/practice'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${PRACTICE_NETWORK}/${id}/public`,
      {
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
    console.error('Error fetching practice sentinel:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
