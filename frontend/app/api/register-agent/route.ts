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

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`TEE error (${chain ?? 'sui'}): ${response.status} - ${errorText}`)
      throw new Error(`External API error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in register-agent API route:', error)
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 })
  }
}
