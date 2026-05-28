import { EVM_TEE_API_PATH, EVM_TEE_NETWORK, resolveEvmTeeNetwork } from '@/constants/evm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chainId, ...payload } = body
    const teeNetwork = chainId ? resolveEvmTeeNetwork(chainId) : EVM_TEE_NETWORK
    const teeUrl = `${EVM_TEE_API_PATH}/${teeNetwork}/consume-prompt`

    const response = await fetch(teeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    if (!response.ok) {
      try {
        const errorJson = JSON.parse(responseText)
        return NextResponse.json(errorJson, { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[EVM TEE] consume-prompt error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to consume agent' },
      { status: 500 }
    )
  }
}
