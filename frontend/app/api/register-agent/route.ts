import { APP_NETWORK, LOCAL_API_PATH } from '@/constants'
import { SOLANA_TEE_API_PATH, SOLANA_TEE_NETWORK } from '@/constants/solana'
import { EVM_TEE_API_PATH, EVM_TEE_NETWORK, resolveEvmTeeNetwork } from '@/constants/evm'
import { NextRequest, NextResponse } from 'next/server'

function getTeeUrl(chain: string, chainId?: number): string {
  switch (chain) {
    case 'solana':
      return `${SOLANA_TEE_API_PATH}/${SOLANA_TEE_NETWORK}/register-agent`
    case 'bnb':
    case 'bot':
    case 'evm': {
      const teeNetwork = chainId ? resolveEvmTeeNetwork(chainId) : EVM_TEE_NETWORK
      return `${EVM_TEE_API_PATH}/${teeNetwork}/register-agent`
    }
    case 'sui':
    default:
      return `${LOCAL_API_PATH}/${APP_NETWORK}/register-agent`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain, chainId, ...payload } = body

    const teeUrl = getTeeUrl(chain, chainId)

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
