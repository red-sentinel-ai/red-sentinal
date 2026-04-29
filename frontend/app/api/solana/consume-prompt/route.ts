import { SOLANA_TEE_API_PATH, SOLANA_TEE_NETWORK } from '@/constants/solana'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const teeUrl = `${SOLANA_TEE_API_PATH}/${SOLANA_TEE_NETWORK}/consume-prompt`

    const response = await fetch(teeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        const errorJson = JSON.parse(responseText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json(
          { error: responseText },
          { status: response.status }
        )
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Solana TEE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to consume agent' }, { status: 500 })
  }
}
