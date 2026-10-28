import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { rateLimit } from '@/lib/server/rate-limit'

/**
 * Resolves the backend attack doc created for an on-chain attack, using the
 * nonce from the Attack ticket plus the attacker address. The frontend needs
 * the attack id to drive the user-signed Walrus record flow (the TEE consumes
 * the backend attack route internally, so the id never reaches the client).
 */
export async function GET(req: Request) {
  const denied = rateLimit(req, { name: 'attack-by-nonce', limit: 30, windowMs: 60_000 })
  if (denied) return denied

  try {
    const { searchParams } = new URL(req.url)
    const network = searchParams.get('network')
    const nonce = searchParams.get('nonce')
    const attackerAddress = searchParams.get('attacker_address')

    if (!network || !nonce || !attackerAddress) {
      return NextResponse.json(
        { error: 'network, nonce and attacker_address are required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${network}/attack/nonce/${encodeURIComponent(
        nonce
      )}?attacker_address=${encodeURIComponent(attackerAddress)}`,
      {
        headers: {
          Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
        },
      }
    )

    const text = await response.text()
    if (!response.ok) {
      return NextResponse.json(
        { error: text },
        { status: response.status }
      )
    }

    return NextResponse.json(JSON.parse(text))
  } catch (error: any) {
    console.error('Error looking up attack by nonce:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
