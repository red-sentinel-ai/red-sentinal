import { NextResponse } from 'next/server'

import { SUI_SENTINEL_API_URL } from '@/constants'
import { BACKEND_API_ADMIN_TOKEN } from '@/lib/server/credentials'
import { resolveTeeEndpoint } from '@/constants/tee'
import type { SupportedChain } from '@/constants/chains'
import { rateLimit } from '@/lib/server/rate-limit'

/**
 * Preflight Validation for a connected Deployment Configuration: connectivity,
 * authentication, tool availability, session capabilities, evidence
 * capabilities, and the defender's fixtures. The backend orchestrates the
 * actual checks; this proxy forwards the Deployment Configuration verbatim.
 *
 * The backend records a passing run under the `network` in the path, and
 * launch admission (`register-agent` → TEE → `/sentinels/<network>`) only
 * admits a configuration validated for that same network. `chain`/`chainId`
 * select it exactly the way `/api/register-agent` resolves the TEE network,
 * so a green preflight is always keyed to the network the launch registers on.
 */
export async function POST(request: Request) {
  const denied = rateLimit(request, { name: 'defend-preflight', limit: 10, windowMs: 60_000 })
  if (denied) return denied

  try {
    const body = await request.json()
    const { chain, chainId, ...payload } = body as {
      chain?: SupportedChain | 'evm'
      chainId?: number
    }

    // 'evm' is a generic alias (the network is derived from chainId), and a
    // missing chain defaults to Sui — same resolution as /api/register-agent.
    const teeChain: SupportedChain = chain === 'evm' ? 'bnb' : (chain ?? 'sui')
    const network = resolveTeeEndpoint(teeChain, chainId).network

    const response = await fetch(
      `${SUI_SENTINEL_API_URL}/sentinels/${network}/connectors/preflight`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BACKEND_API_ADMIN_TOKEN}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      }
    )

    const responseText = await response.text()
    if (!response.ok) {
      try {
        return NextResponse.json(JSON.parse(responseText), { status: response.status })
      } catch {
        return NextResponse.json({ error: responseText }, { status: response.status })
      }
    }
    return NextResponse.json(JSON.parse(responseText))
  } catch (error) {
    console.error('Preflight proxy error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
