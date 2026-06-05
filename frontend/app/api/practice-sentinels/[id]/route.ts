import { NextResponse } from 'next/server'

import { REDTEAM_BASE } from '@/lib/redteam'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const response = await fetch(`${REDTEAM_BASE}/sentinels/${id}/public`, {
      cache: 'no-store',
    })

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
