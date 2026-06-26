import { NextResponse } from 'next/server'

import { REDTEAM_BASE, redteamAuthHeader } from '@/lib/redteam'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params

    const response = await fetch(`${REDTEAM_BASE}/environment-templates/${templateId}`, {
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
    console.error('Error fetching environment template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
