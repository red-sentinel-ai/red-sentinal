import { buildTeeUrl } from '@/constants/tee'
import type { SupportedChain } from '@/constants/chains'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain = 'sui', chainId, ...payload } = body as {
      chain?: SupportedChain
      chainId?: number
    }

    const teeUrl = buildTeeUrl(chain, 'consume-prompt', chainId)
    const response = await fetch(teeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error(`TEE consume-prompt error (${chain}): ${response.status} - ${responseText}`)
      try {
        return NextResponse.json(JSON.parse(responseText), { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }

    return NextResponse.json(JSON.parse(responseText))
  } catch (error: any) {
    console.error('Error in consume-prompt API route:', error)
    return NextResponse.json({ error: error.message || 'Failed to consume agent' }, { status: 500 })
  }
}
