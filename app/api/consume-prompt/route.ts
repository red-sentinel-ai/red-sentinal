import { buildTeeUrl } from '@/constants/tee'
import type { SupportedChain } from '@/constants/chains'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/server/rate-limit'

export async function POST(request: NextRequest) {
  // Open forward to the TEE — throttle so it can't be used as a free compute
  // proxy. On-chain payment is enforced downstream, not here.
  const denied = rateLimit(request, { name: 'consume-prompt', limit: 10, windowMs: 60_000 })
  if (denied) return denied

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
