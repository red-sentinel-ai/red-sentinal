import { buildTeeUrl } from '@/constants/tee'
import type { SupportedChain } from '@/constants/chains'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain, chainId, ...payload } = body as {
      chain?: SupportedChain | 'evm'
      chainId?: number
    }

    // `chain` selects the TEE endpoint. 'evm' is a generic alias (the EVM
    // network is derived from chainId), and a missing chain defaults to Sui.
    const teeChain: SupportedChain = chain === 'evm' ? 'bnb' : (chain ?? 'sui')
    const teeUrl = buildTeeUrl(teeChain, 'register-agent', chainId)

    const response = await fetch(teeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    // Forward the TEE's status and body verbatim. Collapsing these into a generic
    // 500 hides actionable errors — an unsupported `network` comes back as a
    // Fastify validation 400 that the caller needs to see.
    if (!response.ok) {
      console.error(`TEE register-agent error (${chain ?? 'sui'}): ${response.status} - ${responseText}`)
      try {
        return NextResponse.json(JSON.parse(responseText), { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }

    return NextResponse.json(JSON.parse(responseText))
  } catch (error: any) {
    console.error('Error in register-agent API route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register agent' },
      { status: 500 }
    )
  }
}
